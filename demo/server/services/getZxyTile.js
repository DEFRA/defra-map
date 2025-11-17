import fetch from 'node-fetch'

export default async function getZxyTile(url, { z, y, x }) {
  const newURL = url.replace(/\${z}/g, z).replace(/\${x}/g, x).replace(/\${y}/g, y)

  const response = await fetch(newURL)
  if (!response.ok) {
    throw new Error(`Failed to fetch tile: ${response.status}`)
  }

  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer)
}