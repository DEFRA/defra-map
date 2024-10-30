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
  const { xmin, ymin, xmax, ymax } = view.extent
  const bbox = [xmin, ymin, xmax, ymax]
  const { x, y } = view.center
  const centre = [x, y].map(n => Math.round(n))
  const zoom = parseFloat(view.zoom.toFixed(defaults.PRECISION))
  return { bbox, centre, zoom }
}

export const getFeatures = async (provider, point) => {
  const { view, pixelLayers } = provider

  // Get all features at a given pixel
  const pixel = { x: point[0], y: point[1] }
  const hits = await view.hitTest(pixel)
  const featuresAtPixel = hits.results.filter(r => pixelLayers.some(l => r.layer.id === l))
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

  return {
    resultType: 'pixel',
    items,
    featuresTotal: null,
    featuresInViewport: [],
    isFeaturesInMap: false,
    isPixelFeaturesAtPixel: !!items.length,
    isPixelFeaturesInMap: !!pixelLayers.length,
    coord
  }
}
