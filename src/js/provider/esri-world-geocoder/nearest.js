import config from './config.json'

export const getNearest = async (coord, tokenCallback) => {
  const token = (await tokenCallback()).token
  const srs = coord[0] > 1000 ? 27700 : 4326
  coord = coord.map(n => srs === 27700 ? Math.round(n) : n)
  const location = encodeURIComponent(`{x:${coord[0]},y:${coord[1]},spatialReference:{wkid:${srs}}}`)
  const url = config.ESRI_REVERSE_GEOCODE_URL.replace('{token}', token).replace('{location}', location)
  const response = await fetch(url)
  const json = await response.json()
  const address = json?.address
  return address ? `${address.LongLabel.split(', England')[0]}, ${address.Postal}` : null
}
