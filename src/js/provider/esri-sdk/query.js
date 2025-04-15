import { defaults } from './constants'

export const getDetail = async (provider, point, isUserInitiated = false) => {
  const { getNearest, reverseGeocodeToken } = provider
  const viewport = await getViewport(provider)
  const features = await getFeatures(provider, point)

  let place
  if (isUserInitiated && features.resultType === 'pixel') {
    place = await getNearest(features.lngLat, reverseGeocodeToken)
  }

  return {
    ...viewport,
    resultType: features.resultType,
    coord: features.coord,
    features,
    place
  }
}

export const getViewport = async (provider) => {
  // Needs to be paddingBox or boundary extent not view
  const { view } = provider
  const { maxZoom, minZoom } = provider.view.constraints
  const { xmin, ymin, xmax, ymax } = view.extent
  const bounds = [xmin, ymin, xmax, ymax]
  const { x, y } = view.center
  // Easting and northings rounded (10cm) precision
  const center = [x, y].map(n => Math.round(n * 10) / 10)
  const zoom = parseFloat(view.zoom.toFixed(defaults.PRECISION))
  const isMaxZoom = view.zoom + defaults.ZOOM_TOLERANCE >= maxZoom
  const isMinZoom = view.zoom - defaults.ZOOM_TOLERANCE <= minZoom
  return { bounds, center, zoom, isMaxZoom, isMinZoom }
}

export const getFeatures = async (provider, point) => {
  const { view, map, locationLayers } = provider

  const hasVisiblePixelLayers = map.layers.some(l => locationLayers?.includes(l.id) && l.visible)

  // Get all features at a given pixel
  const pixel = { x: point[0], y: point[1] }
  const hits = await view.hitTest(pixel)
  const featuresAtPixel = hits.results.filter(r => locationLayers.some(l => r.layer.id === l))
  const items = featuresAtPixel.map(f => {
    return {
      ...f.graphic.attributes,
      id: f.graphic.uid,
      layer: f.layer.id
    }
  })

  // Get map coord of query
  let coord = view.toMap(pixel)
  coord = [coord.x, coord.y].map(n => Math.round(n))
  // Add lngLat for reverse geocoding
  const lngLat = [coord[0], coord[1]]

  return {
    resultType: 'pixel',
    items,
    featuresTotal: null,
    featuresInViewport: [],
    isFeaturesInMap: false,
    isPixelFeaturesAtPixel: !!items.length,
    isPixelFeaturesInMap: hasVisiblePixelLayers,
    coord,
    lngLat
  }
}
