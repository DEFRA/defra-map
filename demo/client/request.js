const osAuth = {}
const esriAuth = {}

// Must be syncronous for MapLibre and return request object values
export const createTileRequest = (getMap) => { // Factory function to pass a reference to the map instance
  return (url, resourceType) => {
    let headers = {}

    // Maptiler API key
    if (resourceType === 'Style' && url.startsWith('https://api.maptiler.com')) {
      url = `${url}?key=${process.env.MAPTILER_API_KEY}`
    }

    // Mapbox request
    if (resourceType === 'Style' && url.startsWith('https://api.mapbox.com')) {
      url = `${url}?access_token=${process.env.MAPBOX_API_KEY}`
    }

    if (resourceType === 'Source' && url.startsWith('mapbox://mapbox.satellite')) {
      url = `https://api.mapbox.com/v4/mapbox.satellite.json?secure&access_token=${process.env.MAPBOX_API_KEY}`
    }

    if (resourceType === 'Source' && url.startsWith('mapbox://mapbox.mapbox-streets-v8')) {
      url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8.json?secure&access_token=${process.env.MAPBOX_API_KEY}`
    }

    if (['SpriteJSON', 'SpriteImage'].includes(resourceType) && url.startsWith('mapbox://sprites/mapbox/satellite-streets-v11')) {
      url = url.replace('mapbox://sprites/mapbox/satellite-streets-v11', 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/sprite') + `?access_token=${process.env.MAPBOX_API_KEY}`
    }

    if (resourceType === 'Glyphs' && url.startsWith('mapbox://fonts/mapbox/')) {
      url = url.replace('mapbox://fonts/mapbox/', 'https://api.mapbox.com/fonts/v1/mapbox/')
    }

    // OS Vector Tile API
    // if (resourceType === 'Style' && url.startsWith('https://api.os.uk/maps/vector/v1/vts')) {
    //   headers = { Authorization: 'Bearer ' + osAuth.token }
    // }

    // GeoServer WFS request
    if (resourceType === 'Source' && url.includes(process.env.CFF_WARNING_POLYGONS)) {
      const map = getMap()
      const bounds = map.getBounds()
      const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',')
      url += `&bbox=${bbox},EPSG:4326`
    }

    return {
      url, headers
    }
  }
}

// All other requests can be asyncronous and return a request object itself
export const getRequest = async (url) => {
  let options = {}

  // OS Open Names
  if (url.startsWith('https://api.os.uk')) {
    const token = (await getOsToken()).token
    options = {headers: { Authorization: 'Bearer ' + token }}
  }

  return new Request(url, options)
}

const getOsToken = async () => {
  // Check token is valid
  const isExpired = !Object.keys(osAuth).length || Date.now() >= osAuth?.expiresAt

  if (isExpired) {
    try {
      const response = await fetch('/os-token', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const json = JSON.parse(await response.json()) // Requires JSON parse - Webpack issue possibly?
      osAuth.token = json.access_token
      osAuth.expiresAt = Date.now() + ((json.expires_in - 30) * 1000)
    } catch (err) {
      console.log('Error getting OS access token: ', err)
    }
  }

  return osAuth
}

export const setEsriConfig = async (esriConfig) => {
  const auth = await getEsriToken()
  esriConfig.apiKey = auth.token
  const interceptors = getInterceptors()
  interceptors.forEach(interceptor => esriConfig.request.interceptors.push(interceptor))
}

// ESRI return an array of interceptor objects
const getInterceptors = () => {
  return [{
    urls: 'https://api.os.uk/maps/vector/v1/vts',
    before: async params => {
      const token = (await getOsToken()).token
      params.requestOptions.headers = {
        Authorization: 'Bearer ' + token
      }
    }
  }]
}

const getEsriToken = async () => {
  // *ESRI manages this somehow?
  const hasToken = esriAuth.token

  if (!hasToken) {
    try {
      const response = await fetch('/esri-token')
      const json = await response.json()
      esriAuth.token = json.token
    } catch (err) {
      console.log('Error getting ESRI access token: ', err)
    }
  }

  return esriAuth
}

// Used to determine if extra WFS request is required
export const isBoundsWithin = (inner, outer) => {
  if (!(inner && outer)) {
    return false
  }

  const innerSW = inner.getSouthWest()
  const innerNE = inner.getNorthEast()
  const outerSW = outer.getSouthWest()
  const outerNE = outer.getNorthEast()

  const isWithin =
    innerSW.lng >= outerSW.lng &&
    innerSW.lat >= outerSW.lat &&
    innerNE.lng <= outerNE.lng &&
    innerNE.lat <= outerNE.lat

  return isWithin
}