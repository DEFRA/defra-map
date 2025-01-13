// import { polylabel } from 'polylabel'
import { distance as turfDistance } from '@turf/distance'
import { point as TurfPoint } from '@turf/helpers'
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

const addFeatureProperties = (map, featureCollections) => {
  const features = featureCollections.map(c => {
    const { lng, lat } = map.getCenter()
    const coord = [lng, lat] // turfCenterOfMass(c).geometry.coordinates
    const p1 = new TurfPoint(coord)
    const p2 = new TurfPoint([lng, lat])
    const distance = turfDistance(p1, p2, { units: 'metres' })
    const f = c.features[0]
    return {
      ...f.properties,
      geometryType: f.geometry.type,
      coord,
      distance
    }
  })
  return features
}

const combineFeatures = (features) => {
  const combinedFeatures = []
  features.forEach(f => {
    const group = combinedFeatures.find(c => c.length && ((f.id && f.id === c[0].id) || (f.properties.id && f.properties.id === c[0].properties.id)))
    group?.push(f) || combinedFeatures.push([f])
  })
  const featureCollections = combinedFeatures.map(c => {
    return {
      type: 'FeatureCollection',
      features: c.map(f => {
        return {
          id: f.id || f.properties.id,
          properties: { ...f.properties, id: f.id || f.properties.id, layer: f.layer.id },
          geometry: f.geometry
        }
      })
    }
  })
  return featureCollections
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
  const { map, featureLayers, pixelLayers, paddingBox, scale } = provider
  const bounds = getFocusBounds(paddingBox, scale)

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

  // Combine duplicate features
  const featuresCollections = featuresTotal <= defaults.MAX_FEATURES ? combineFeatures(renderedFeaturesInViewport) : []

  // Add props and sort features
  const featuresInViewport = addFeatureProperties(map, featuresCollections).sort((a, b) => a.distance - b.distance)

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
  if (features?.length) {
    const feature = features[0]
    return `${feature.layer.layout['text-field']} (${feature.properties.layer})`
  }
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
  const { map, paddingBox, scale } = provider
  const bounds = getFocusBounds(paddingBox, scale)
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
