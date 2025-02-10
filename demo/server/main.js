const expressStaticGzip = require('express-static-gzip')
const authESRI = require('./esri-auth')
const authOS = require('./os-auth')
const fs = require('fs')
const path = require('path')

module.exports = {
  setupMiddlewares
}

function setupMiddlewares (middlewares, { app }) {
  const __dirname = __filename.replace(path.basename(__filename), '')
  const pluginAssets = path.resolve(__dirname, '../../plugin')

  app.use(
    expressStaticGzip(path.resolve(__dirname, '../dist'), {
      enableBrotli: true,
      orderPreference: ['br', 'gz'],
      serveStatic: {
        cacheControl: false, // Disable cache control for dev purposes
      }
    })
  )

  app.get('/plugin-assets/:type/:name', async (req, res, next) => {
    fs.readFile(path.resolve(pluginAssets + `/${req.params.type}/${req.params.name}`), (err, result) => {
      if (err) {
        res.sendStatus(404)
        return
      }
      res.type('.css')
      res.send(result)
    })
  })

  app.get([
    '/styles/vts-tile.json',
    '/styles/open-tile.json',
    '/styles/OS_VTS_27700_Outdoor.json',
    '/styles/OS_VTS_27700_Open_Outdoor.json',
    '/styles/OS_VTS_27700_Dark.json',
    '/styles/OS_VTS_27700_Open_Dark.json'
  ], async (req, res, next) => {
    fs.readFile(path.resolve(__dirname, req.originalUrl.substring(1).split('?')[0]), (err, result) => {
      if (err) throw err
      const jsonData = JSON.parse(result)
      res.setHeader('Content-Type', 'application/json')
      res.json(jsonData)
    })
  })

  app.get('/esri-token', async (req, res, next) => {
    const response = await authESRI({
      clientId: process.env.ESRI_CLIENT_ID,
      clientSecret: process.env.ESRI_CLIENT_SECRET
    })
    res.json({ token: response })
  })

  app.get('/os-token', async (req, res, next) => {
    const response = await authOS({
      clientId: process.env.OS_CLIENT_ID,
      clientSecret: process.env.OS_CLIENT_SECRET
    })
    res.json(response)
  })

  return middlewares
}
