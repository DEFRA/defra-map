import { getFocusBounds } from '../../lib/viewport'
import { defaults } from './constants'

export const addPointerQuery = (provider) => {
  const { map, featureLayers, pixelLayers } = provider

  if (!(featureLayers || pixelLayers)) return

  // Toggle cursor style for feature layers
  featureLayers.forEach(layer => {
    map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
  })
}

export const getDetail = async (provider, pixel, isUserInitiated = false) => {
  const { map, getNearest, reverseGeocodeToken } = provider
  const viewport = getViewport(map)
  const features = getFeatures(provider, pixel)

  let place
  if (isUserInitiated && features.resultType === 'pixel') {
    place = await getNearest(features.coord, reverseGeocodeToken)
  }

  return {
    ...viewport,
    resultType: features.resultType,
    coord: features.coord,
    features,
    place
  }
}

export const getViewport = (map) => {
  const bounds = map.getBounds()
  const bbox = [...bounds.toArray()[0], ...bounds.toArray()[1]].map(n => parseFloat(n.toFixed(defaults.PRECISION)))
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
  const { map, featureLayers, pixelLayers, frame, scale } = provider
  const bounds = getFocusBounds(frame, scale)

  // Get all features under a given pixel
  let layers = [...featureLayers, ...pixelLayers]
  layers = map.getStyle().layers
    .filter(l => layers.includes(l?.id) && l?.layout?.visibility !== 'none')
    .map(l => l.id)
  const hasPixelLayers = layers.some(l => pixelLayers?.includes(l))
  let featuresAtPixel = map.queryRenderedFeatures(pixel, { layers })
  featuresAtPixel = [...new Map(featuresAtPixel.map(f => [(f.id || f.properties?.id), f])).values()]

  // Get all 'featureLayer' features in the viewport
  layers = layers.filter(l => featureLayers?.includes(l))
  let featuresInViewport = map.queryRenderedFeatures(bounds, { layers })
  featuresInViewport = [...new Map(featuresInViewport.map(f => [(f.id || f.properties?.id), f])).values()]
  const featuresTotal = featuresInViewport.length
  featuresInViewport = featuresTotal <= 9 ? featuresInViewport : []

  // Get long lat of query
  let lngLat
  if (pixel) {
    lngLat = map.unproject(pixel)
    lngLat = [lngLat.lng, lngLat.lat]
    lngLat = lngLat.map(c => Math.round(c * Math.pow(10, 6)) / Math.pow(10, 6))
  }

  const feature = featuresAtPixel.length ? featuresAtPixel[0] : null
  const featureType = feature ? featureLayers?.includes(feature?.layer.id) ? 'feature' : 'pixel' : null
  const resultType = featureType || (hasPixelLayers ? 'pixel' : null)

  return {
    resultType,
    items: featuresAtPixel.map(f => {
      return {
        ...f.properties,
        id: f.id || f.properties.id,
        name: f.properties.name,
        layer: f.layer.id
      }
    }),
    featuresTotal,
    featuresInViewport: featuresInViewport.map(f => {
      return {
        ...f.properties,
        id: f.id || f.properties.id,
        name: f.properties.name,
        layer: f.layer.id
      }
    }),
    isFeaturesInMap: !!layers.length,
    isPixelFeaturesAtPixel: pixelLayers?.includes(feature?.layer.id),
    isPixelFeaturesInMap: hasPixelLayers,
    coord: lngLat
  }
}

export const toggleSelectedFeature = (map, id) => {
  if (!map?.getStyle()) return

  const selectedLayers = map.getStyle().layers.filter(l => l.id.includes('selected'))
  for (let i = 0; i < selectedLayers.length; i++) {
    const layer = selectedLayers[i]
    map.setLayoutProperty(layer.id, 'visibility', id ? 'visible' : 'none')
    map.setFilter(layer.id, ['==', 'id', id || ''])
  }
}
