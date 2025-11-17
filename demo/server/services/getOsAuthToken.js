import https from 'https'
import querystring from 'querystring'

export default async function authOS({ clientId, clientSecret }) {
  const postData = querystring.stringify({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })

  const options = {
    method: 'POST',
    host: 'api.os.uk',
    path: '/oauth2/token/v1',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''

      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve(parsed)
        } catch (err) {
          reject(new Error(`Invalid JSON response: ${data}`))
        }
      })
    })

    req.on('error', (error) => reject(error))
    req.write(postData)
    req.end()
  })
}
