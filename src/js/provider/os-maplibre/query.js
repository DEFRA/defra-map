import polylabel from 'polylabel'
import { area as turfArea } from '@turf/area'
import { distance as turfDistance } from '@turf/distance'
import { point as TurfPoint, polygon as TurfPolygon, multiPolygon as TurfMultiPolygon } from '@turf/helpers'
import { bboxClip as TurfBboxClip } from '@turf/bbox-clip'
import { getFocusBounds } from '../../lib/viewport'
import { defaults } from './constants'

const getPaddedBounds = map => {
  const padding = map.getPadding()
  const bounds = map.getBounds()

  // Get the pixel coordinates for the current bounds
  const sw = map.project([bounds.getWest(), bounds.getSouth()])
  const ne = map.project([bounds.getEast(), bounds.getNorth()])

  // Adjust for padding
  sw.x += padding.left
  sw.y -= padding.bottom
  ne.x -= padding.right
  ne.y += padding.top

  // Convert back to geographical coordinates
  const paddedSW = map.unproject(sw)
  const paddedNE = map.unproject(ne)

  // Create new bounds
  return [[paddedSW.lng, paddedSW.lat], [paddedNE.lng, paddedNE.lat]]
}

const addFeatureProperties = (map, features) => {
  return features.map(f => {
    const { lng, lat } = map.getCenter()
    const coord = f.geometry.type === 'Polygon' ? polylabel(f.geometry.coordinates, 0.00001) : f.geometry.coordinates
    const p1 = new TurfPoint([coord[0], coord[1]])
    const p2 = new TurfPoint([lng, lat])
    const distance = turfDistance(p1, p2, { units: 'metres' })
    return {
      ...f.properties,
      geometryType: f.geometry.type,
      coord,
      distance
    }
  })
}

const intersectFeatures = (bounds, features) => {
  features = features.map(f => {
    if (['Polygon', 'MultiPolygon'].includes(f.geometry.type)) {
      const polygon = f.geometry.type === 'Polygon' ? new TurfPolygon(f.geometry.coordinates) : new TurfMultiPolygon(f.geometry.coordinates)
      const clipped = TurfBboxClip(polygon, bounds)
      // Remove empty rings
      clipped.geometry.coordinates = clipped.geometry.coordinates.filter(c => c.length)
      // const clippedGeometry = martinez.intersection(boundsPolygon.geometry.coordinates, f.geometry.coordinates)
      f.geometry = clipped.geometry
    }
    return f
  })
  return features
}

const combineFeatures = (features) => {
  const combined = []
  features.forEach(f => {
    const group = combined.find(c => c.length && ((f.id && f.id === c[0].id) || (f.properties.id && f.properties.id === c[0].properties.id)))
    if (f.geometry.type === 'MultiPolygon') {
      // Get largest single polygon, outer shape (excluding holes) and add area
      const parts = f.geometry.coordinates.map(c => {
        const polygon = new TurfPolygon([c[0]])
        polygon.properties = { area: turfArea(polygon) }
        return polygon
      })
      const largest = parts.find(p => p.properties.area === Math.max(...parts.map(b => b.properties.area)))
      f.geometry = largest.geometry
      f.properties.area = largest.properties.area
    } else if (f.geometry.type === 'Polygon') {
      // Get out shape (excluding holes) and add area
      const polygon = new TurfPolygon([f.geometry.coordinates[0]])
      f.properties.area = turfArea(polygon)
      f.geometry = polygon.geometry
    } else {
      f.properties.area = 0
    }
    group?.push(f) || combined.push([f])
  })
  // Return largest single polygon
  return combined.map(g => g.find(f => f.properties.area === Math.max(...g.map(b => b.properties.area))))
}

export const addMapHoverBehaviour = (provider) => {
  const { map, featureLayers, labelLayers } = provider

  // Toggle cursor style for features
  map.on('mousemove', [...featureLayers, ...labelLayers], e => {
    const features = map.queryRenderedFeatures(e.point, { layers: [...featureLayers, ...labelLayers] })
    const isFeature = !e.originalEvent.altKey && features && !!features.find(f => featureLayers.includes(f.layer.id))
    const isLabel = e.originalEvent.altKey && features && !!features.find(f => labelLayers.includes(f.layer.id))
    map.getCanvas().style.cursor = isFeature || isLabel ? 'pointer' : ''
  })

  // Revert cursor on mouseout
  map.on('mouseout', [...featureLayers, ...labelLayers], () => { map.getCanvas().style.cursor = '' })
}

export const getDetail = async (provider, pixel, isUserInitiated = false) => {
  const { map, getNearest, reverseGeocodeToken, selectedLayers } = provider
  const viewport = getViewport(map)
  const features = getFeatures(provider, pixel)
  const label = getHighlightedLabel(map)
  const selectedId = getSelectedFeatureId(map, selectedLayers)
  let place
  if (isUserInitiated && features.resultType === 'pixel') {
    place = await getNearest(features.coord, reverseGeocodeToken)
  }

  return {
    ...viewport,
    resultType: features.resultType,
    coord: features.coord,
    selectedId,
    features,
    place,
    label
  }
}

export const getViewport = (map) => {
  const bounds = getPaddedBounds(map)
  const bbox = bounds.flat(1).map(n => parseFloat(n.toFixed(defaults.PRECISION)))
  let centre = map.getCenter()
  centre = centre.toArray().map(n => parseFloat(n.toFixed(defaults.PRECISION)))
  const zoom = parseFloat(map.getZoom().toFixed(defaults.PRECISION))
  return {
    bbox,
    centre,
    zoom
  }
}

export const getFeatures = (provider, pixel) => {
  const { map, target, featureLayers, pixelLayers, paddingBox, scale } = provider
  const bounds = getFocusBounds(paddingBox, target, scale)

  // Get all visible feature and pixel layers
  let layers = [...featureLayers, ...pixelLayers]
  layers = map.getStyle()?.layers.filter(l => layers.includes(l?.id) && l?.layout?.visibility !== 'none').map(l => l.id)

  // Get all features at given pixel
  let featuresAtPixel = map.queryRenderedFeatures(pixel, { layers })
  featuresAtPixel = [...new Map(featuresAtPixel.map(f => [(f.id || f.properties?.id), {
    ...f.properties,
    id: f.id || f.properties.id,
    name: f.properties.name,
    layer: f.layer.id
  }])).values()]

  // Get all 'featureLayer' features in the viewport
  const renderedFeaturesInViewport = map.queryRenderedFeatures(bounds, { layers: featureLayers })

  // Get total 'featureLayer' features in viewport (May be more than 9)
  const featuresTotal = Array.from(new Set(renderedFeaturesInViewport.map(f => f.id || f.properties.id))).length

  // Get geometry that intersects bounds
  const intersectingFeatures = intersectFeatures(getPaddedBounds(map).flat(1), renderedFeaturesInViewport)

  // Split multi polygons and combine duplicate features
  const polygonFeatures = featuresTotal <= defaults.MAX_FEATURES ? combineFeatures(intersectingFeatures) : []

  // Add props and sort features
  const featuresInViewport = addFeatureProperties(map, polygonFeatures).sort((a, b) => a.distance - b.distance)

  // Get long lat of query
  let lngLat
  if (pixel) {
    lngLat = map.unproject(pixel)
    lngLat = [lngLat.lng, lngLat.lat]
    lngLat = lngLat.map(c => Math.round(c * Math.pow(10, defaults.PRECISION)) / Math.pow(10, defaults.PRECISION))
  }

  // Set 'features' result type
  const feature = featuresAtPixel.length ? featuresAtPixel[0] : null
  const featureType = (featureLayers?.includes(feature?.layer) && 'feature') || (pixelLayers?.includes(feature?.layer) && 'pixel')
  const hasPixelLayers = layers?.some(l => pixelLayers?.includes(l))
  const resultType = featureType || (hasPixelLayers ? 'pixel' : null)

  return {
    resultType,
    items: featuresAtPixel,
    featuresTotal,
    featuresInViewport,
    isFeaturesInMap: !!layers.length,
    isPixelFeaturesAtPixel: pixelLayers?.includes(feature?.layer),
    isPixelFeaturesInMap: hasPixelLayers,
    coord: lngLat
  }
}

export const toggleSelectedFeature = (map, selectedLayers, id) => {
  if (map?.getStyle()) {
    for (const layer of selectedLayers) {
      map.setLayoutProperty(layer, 'visibility', id ? 'visible' : 'none')
      map.setFilter(layer, ['==', 'id', id || ''])
    }
  }
}

export const getHighlightedLabel = (map) => {
  const features = map.queryRenderedFeatures({ layers: ['label'] })
  let text
  if (features?.length) {
    const label = map.getStyle()?.layers.find(l => l.id === 'label')?.layout['text-field']
    text = `${label} (${features[0].properties.layer})`
  }
  return text
}

export const getSelectedFeatureId = (map, selectedLayers) => {
  const features = map.queryRenderedFeatures({ layers: selectedLayers })
  return features.length ? (features[0]?.id || features[0].properties?.id) : null
}

export const getLabel = (provider, pixel) => {
  const { map, labelLayers } = provider
  const feature = map.queryRenderedFeatures(pixel, { layers: labelLayers })[0]
  return feature
}

export const getLabels = (provider) => {
  const { map, target, paddingBox, scale } = provider
  const bounds = getFocusBounds(paddingBox, target, scale)
  const features = map.queryRenderedFeatures(bounds, { layers: provider.labelLayers })
  const labels = features.map(f => {
    let pixel = f.geometry.type === 'Point' && map.project(f.geometry.coordinates)
    if (f.geometry.type !== 'Point') {
      const coordinates = f.geometry.coordinates.flat(f.geometry.type === 'MultiLineString' ? 1 : 0)
      const pixels = coordinates.map(c => map.project(c))
      const xS = pixels.map(p => p.x)
      const yS = pixels.map(p => p.y)
      const centreX = ((Math.max(...xS) - Math.min(...xS)) / 2) + Math.min(...xS)
      const centreY = ((Math.max(...yS) - Math.min(...yS)) / 2) + Math.min(...yS)
      pixel = { x: centreX, y: centreY }
    }
    return {
      feature: f,
      pixel: [pixel.x, pixel.y]
    }
  })
  return labels
}
