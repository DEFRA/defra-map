const osAuth = {}
const esriAuth = {}

// Must be syncronous for MapLibre and return request object values
export const getTileRequest = (url, resourceType) => {
  let headers = {}

  // Maptiler API key
  if (resourceType === 'Style' && url.startsWith('https://api.maptiler.com')) {
    url = `${url}?key=${process.env.MAPTILER_API_KEY}`
  }

  // OS Vector Tile API
  // if (resourceType === 'Style' && url.startsWith('https://api.os.uk/maps/vector/v1/vts')) {
  //   headers = { Authorization: 'Bearer ' + osAuth.token }
  // }

  return {
    url, headers
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

  // ESRI World Geocoder
  if (url.startsWith('https://geocode-api.arcgis.com')) {
    const token = (await getEsriToken()).token
    url = `${url}&token=${token}`
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