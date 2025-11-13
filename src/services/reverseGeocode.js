let reverseGeocodeFn = null

export function createReverseGeocode (provider, transformRequest, crs) {
  reverseGeocodeFn = async (zoom, coord) => {
    const providerFn = await provider.load()
    return providerFn(zoom, coord, transformRequest, crs)
  }
}

export function reverseGeocode (zoom, coord) {
  if (!reverseGeocodeFn) {
    throw new Error('ReverseGeocode not initialised')
  }
  return reverseGeocodeFn(zoom, coord)
}
