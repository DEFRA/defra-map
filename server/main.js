import express from 'express'
import expressStaticGzip from 'express-static-gzip'
import getOsAuthToken from './services/getOsAuthToken.js'
import getZxyTile from './services/getZxyTile.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Equivalent of __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function setupMiddlewares(middlewares, { app }) {
  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }))

  // Optionally, also parse URL-encoded bodies (needed if mimicking the OS GIQTrans form)
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  
  app.use(
    expressStaticGzip(path.resolve(__dirname, '../dist'), {
      enableBrotli: true,
      orderPreference: ['br', 'gz'],
      serveStatic: {
        cacheControl: false, // Disable cache control for dev purposes
      },
    })
  )

  app.get([
    '/styles/OS_VTS_3857_Outdoor.json',
    '/styles/OS_VTS_3857_Dark.json',
    '/styles/OS_VTS_3857_Black_and_White.json',
    '/styles/apgb-esri-imagery.json',
    '/styles/apgb-imagery.json'
  ], async (req, res, next) => {
    const filePath = path.resolve(
      __dirname,
      req.originalUrl.substring(1).split('?')[0]
    )
    fs.readFile(filePath, (err, result) => {
      if (err) throw err
      const jsonData = JSON.parse(result)
      res.setHeader('Content-Type', 'application/json')
      res.json(jsonData)
    })
  })

  app.get('/os-token', async (req, res, next) => {
    const response = await getOsAuthToken({
      clientId: process.env.OS_CLIENT_ID,
      clientSecret: process.env.OS_CLIENT_SECRET,
    })
    res.json(response)
  })

  app.get('/apgb-tile/:z/:y/:x.png', async (req, res) => {
    try {
      const { z, x, y } = req.params
      const imageBuffer = await getZxyTile(process.env.APGB_URL, { z, x, y })
      res.set('Content-Type', 'image/png')
      res.send(imageBuffer)
    } catch (err) {
      console.error(err)
      res.status(500).send('Tile fetch failed')
    }
  })

  return middlewares
}
