// src/plugins/search/utils/fetch.js
export async function fetchDataset(url, options = {}, transformRequest) {
  let request = new Request(url, options)

  if (transformRequest) {
    try {
      request = await transformRequest(request)
    } catch (err) {
      console.error('Error transforming request:', err)
      return null
    }
  }

  const response = await fetch(request)

  if (!response.ok) {
    console.error('Fetch error', response.status)
    return null
  }

  const json = await response.json()
  return json
}
