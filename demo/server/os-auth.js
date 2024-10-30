const https = require('https')
const querystring = require('querystring')

module.exports = async ({ clientId, clientSecret }) => {
  const postData = querystring.stringify({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  })

  const options = {
    method: 'POST',
    host: 'api.os.uk',
    path: '/oauth2/token/v1',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      res.setEncoding('utf8')
      res.on('data', data => {
        resolve(data)
      })
    })

    req.on('error', error => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}
