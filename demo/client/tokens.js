const osAuth = {}
const esriAuth = {}

export const getOsToken = () => new Promise((resolve, reject) => {
  // Check token is valid
  const isExpired = !(osAuth.expiresAt && (Date.now() < osAuth?.expiresAt))

  if (isExpired) {
    fetch('/os-token', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => response.json()).then(data => {
      const json = JSON.parse(data)
      osAuth.token = json.access_token
      osAuth.expiresAt = Date.now() + ((json.expires_in - 30) * 1000)
      resolve(osAuth)
    }).catch(err => {
      reject(console.log('Error getting OS access token: ', err))
    })
  } else {
    resolve(osAuth)
  }
})

export const getEsriToken = () => new Promise((resolve, reject) => {
  // *ESRI manages this somehow?
  const hasToken = esriAuth.token

  if (!hasToken) {
    fetch('/esri-token').then(response => response.json()).then(json => {
      esriAuth.token = json.token
      resolve(esriAuth)
    }).catch(err => {
      reject(console.log('Error getting ESRI access token: ', err))
    })
  } else {
    resolve(esriAuth)
  }
})
