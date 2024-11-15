const osAuth = {}
const esriAuth = {}

export const getOsToken = async () => {
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

export const getEsriToken = async () => {
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