// -----------------------------------------------------------------------------
// Internal (not exported)
// -----------------------------------------------------------------------------

const getMapStateFromURL = (id) => {
  const params = new URLSearchParams(window.location.search)
  const centerStr = params.get(`${id}:center`)
  const zoomStr = params.get(`${id}:zoom`)
  if (!centerStr || !zoomStr) {
    return null
  }
  const [lng, lat] = centerStr.split(',').map(Number)
  const zoom = Number(zoomStr)
  return { center: [lng, lat], zoom }
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

const setMapStateInURL = (id, state) => {
  const url = new URL(window.location.href)
  const params = [...new URLSearchParams(url.search)].map(([key, value]) => `${key}=${value}`)
  const newParams = []
  if (state.center) {
    newParams.push(`${id}:center=${state.center[0]},${state.center[1]}`)
  }
  if (state.zoom != null) {
    newParams.push(`${id}:zoom=${state.zoom}`)
  }
  const filteredParams = params.filter(p => {
    return !newParams.some(np => np.split('=')[0] === p.split('=')[0])
  })
  const hash = url.hash || ''
  const newUrl = `${url.origin}${url.pathname}?${[...filteredParams, ...newParams].join('&')}${hash}`
  window.history.replaceState(null, '', newUrl)
}

// Determine initial map state based on URL, bounds, or defaults
const getInitialMapState = ({ id, center, zoom, bounds }) => {
  const savedState = getMapStateFromURL(id)
  if (savedState) {
    return {
      center: savedState.center,
      zoom: savedState.zoom,
      bounds: undefined
    }
  } else if (bounds) {
    return {
      center: undefined,
      zoom: undefined,
      bounds
    }
  }
  return {
    center,
    zoom,
    bounds: undefined
  }
}

export {
  setMapStateInURL,
  getInitialMapState
}
