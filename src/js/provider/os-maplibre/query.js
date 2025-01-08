import { centerOfMass as turfCenterOfMass } from '@turf/center-of-mass'
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

const parseFeatures = (map, features) => {
  features = features.map(f => {
    const coord = turfCenterOfMass(f.geometry).geometry.coordinates
    const { lng, lat } = map.getCenter()
    const { x, y } = map.project(coord)
    const p1 = new TurfPoint(coord)
    const p2 = new TurfPoint([lng, lat])
    const distance = turfDistance(p1, p2, { units: 'metres' })
    return {
      ...f.properties,
      id: f.id || f.properties.id,
      name: f.properties.name,
      layer: f.layer.id,
      pixel: [x, y],
      distance
    }
  })
  
  return features
}

export const addHoverBehaviour = (provider) => {
  const { map, featureLayers, labelLayers } = provider

  // Toggle cursor style for features
  if (featureLayers) {
    map.on('mouseover', featureLayers, e => { !e.originalEvent.altKey && (map.getCanvas().style.cursor = 'pointer') })
  }

  // Toggle cursor style for labels
  if (labelLayers) {
    map.on('mouseover', labelLayers, e => { e.originalEvent.altKey && (map.getCanvas().style.cursor = 'pointer') })
  }

  // Revert cursor on mouseout
  map.on('mouseout', [...featureLayers, ...labelLayers], () => { map.getCanvas().style.cursor = '' })
}

export const getDetail = async (provider, pixel, isUserInitiated = false) => {
  const { map, getNearest, reverseGeocodeToken } = provider
  const viewport = getViewport(map)
  const features = getFeatures(provider, pixel)
  const label = getHighlightedLabel(map)
  let place
  if (isUserInitiated && features.resultType === 'pixel') {
    place = await getNearest(features.coord, reverseGeocodeToken)
  }

  return {
    ...viewport,
    resultType: features.resultType,
    coord: features.coord,
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

  // Get all features under a given pixel
  let layers = [...featureLayers, ...pixelLayers]
  layers = map.getStyle()?.layers
    .filter(l => layers.includes(l?.id) && l?.layout?.visibility !== 'none')
    .map(l => l.id)
  const hasPixelLayers = layers?.some(l => pixelLayers?.includes(l))
  let featuresAtPixel = map.queryRenderedFeatures(pixel, { layers })
  featuresAtPixel = [...new Map(featuresAtPixel.map(f => [(f.id || f.properties?.id), {
    ...f.properties,
    id: f.id || f.properties.id,
    name: f.properties.name,
    layer: f.layer.id
  }])).values()]

  // Get all 'featureLayer' features in the viewport
  layers = layers?.filter(l => featureLayers?.includes(l))
  let featuresInViewport = map.queryRenderedFeatures(bounds, { layers })
  featuresInViewport = [...new Map(featuresInViewport.map(f => [(f.id || f.properties?.id), f])).values()]
  const featuresTotal = featuresInViewport.length
  featuresInViewport = featuresTotal <= defaults.MAX_FEATURES ? featuresInViewport : []

  // Add props and sort features
  featuresInViewport = parseFeatures(map, featuresInViewport)

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

export const toggleSelectedFeature = (map, id) => {
  if (map?.getStyle()) {
    const selectedLayers = map.getStyle().layers.filter(l => l.id.includes('selected'))
    for (const layer of selectedLayers) {
      map.setLayoutProperty(layer.id, 'visibility', id ? 'visible' : 'none')
      map.setFilter(layer.id, ['==', 'id', id || ''])
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
