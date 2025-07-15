const fetch = require('node-fetch')

module.exports = async ({ z, y, x }) => {
  const url = process.env.APGB_URL.replace(/\${z}/g, z).replace(/\${x}/g, x).replace(/\${y}/g, y)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch tile: ${response.status}`)
  }
  const buffer = await response.buffer()
  return buffer
}
