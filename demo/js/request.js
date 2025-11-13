const osAuth = {}

const transformGeocodeRequest = (request) => {
  // Add API key to OS Names service
  if(request.url.startsWith('https://api.os.uk')) {
    const url = new URL(request.url)
    url.searchParams.set('key', process.env.OS_API_KEY)
    return new Request(url.toString(), {
      method: request.method,
      headers: request.headers
    })
  }

  return request
}

const transformTileRequest = (url, resourceType) => {
  let headers = {}

  // OS Vector Tile API
  if(resourceType !== 'Style' && url.startsWith('https://api.os.uk')) {
    url = new URL(url)
    if (!url.searchParams.has('key')) {
      url.searchParams.append('key', process.env.OS_CLIENT_ID)
    }
    if(!url.searchParams.has('srs')) {
      url.searchParams.append('srs', 3857)
    }
    url = new Request(url).url
  }

  return {
    url, headers
  }
}

const transformDataRequest = (request, bbox) => {
  return {
    url: `${process.env.WFS_SERVICE_URL}?wfs_url=${encodeURIComponent(request.url)}&bbox=${bbox}`
  }
}

export {
  transformGeocodeRequest,
  transformTileRequest,
  transformDataRequest
}