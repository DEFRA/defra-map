export const fetchGeojson = async (url, transformRequest, bbox) => {
  if (!url) {
    return null
  }

  let request = { url, options: { headers: {} } }

  // Allow external request transform
  if (typeof transformRequest === 'function') {
    const transformed = await transformRequest(request, bbox)

    if (transformed) {
      request.url = transformed.url || request.url
      request.options = {
        ...request.options,
        ...transformed.options,
        headers: {
          ...request.options.headers,
          ...transformed.headers,
          ...transformed.options?.headers
        }
      }
    }
  }

  const res = await fetch(request.url, request.options)

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  return res.json()
}
