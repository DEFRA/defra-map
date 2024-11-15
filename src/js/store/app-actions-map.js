const containerReady = (state) => {
  return {
    ...state,
    isContainerReady: true
  }
}

const setSearch = (state, payload) => {
  return {
    ...state,
    search: payload.data
  }
}

const setInfo = (state, payload) => {
  // Restore previous panel only if it was the key
  let previousPanel = (state.activePanel !== 'INFO' && state.activePanel) || state.previousPanel
  previousPanel = previousPanel === 'KEY' && 'KEY'
  let activePanel = state.activePanel === 'INFO' ? state.previousPanel : state.activePanel
  activePanel = payload ? 'INFO' : activePanel
  return {
    ...state,
    info: payload,
    previousPanel,
    activePanel,
    hasViewportLabel: false
  }
}

const setDraw = (state, payload) => {
  return {
    ...state,
    queryPolygon: payload,
    targetMarker: null
  }
}

const setSelected = (state, payload) => {
  return {
    ...state,
    featureId: payload.featureId,
    targetMarker: payload.targetMarker,
    activePanelHasFocus: payload.activePanelHasFocus || state.activePanelHasFocus,
    hash: Date.now()
  }
}

const error = (state, payload) => {
  return {
    ...state,
    error: {
      label: payload.label,
      message: payload.message
    },
    activePanel: 'ERROR',
    hasViewportLabel: false
  }
}

const open = (state, payload) => {
  return {
    ...state,
    previousPanel: state.activePanel,
    activePanel: payload,
    activePanelHasFocus: true,
    hasViewportLabel: false,
    targetMarker: payload === 'SEARCH' && null,
    featureId: payload === 'INFO' ? state.featureId : ''
  }
}

const close = (state, payload) => {
  // Restore previous panel only if it was the key
  let activePanel = (state.previousPanel !== state.activePanel) && state.previousPanel
  activePanel = activePanel === 'KEY' && 'KEY'
  // Close all panels including key
  activePanel = !payload ? activePanel : null
  return {
    ...state,
    featureId: null,
    targetMarker: null,
    previousPanel: null,
    activePanelHasFocus: !activePanel,
    activePanel
  }
}

const setIsMobile = (state, payload) => {
  return {
    ...state,
    isMobile: payload.value
  }
}

const setIsDesktop = (state, payload) => {
  return {
    ...state,
    isDesktop: payload.value,
    isFixed: state.legend?.position?.includes('fixed') && payload.value
  }
}

const setIsKeyboard = (state, payload) => {
  return {
    ...state,
    isKeyboard: payload.value
  }
}

const setMode = (state, payload) => {
  return {
    ...state,
    mode: payload.value,
    query: Object.hasOwn(payload, 'query') ? payload.query : state.query,
    activePanel: state.mode !== 'draw' && payload.value === 'frame' && 'HELP',
    featureId: null,
    targetMarker: null
  }
}

const toggleSegments = (state, payload) => {
  return {
    ...state,
    segments: payload.segments,
    layers: payload.layers,
    featureId: null,
    targetMarker: null
  }
}

const toggleLayers = (state, payload) => {
  return {
    ...state,
    layers: payload
  }
}

const toggleViewportLabel = (state, payload) => {
  const hasViewportLabel = payload.data && (!state.isMobile || !state.activePanel || state.activePanel === 'LEGEND')
  return {
    ...state,
    hasViewportLabel
  }
}

export const actionsMap = {
  CONTAINER_READY: containerReady,
  SET_AVAILABILITY: setSearch,
  SET_INFO: setInfo,
  SET_DRAW: setDraw,
  SET_SELECTED: setSelected,
  ERROR: error,
  OPEN: open,
  CLOSE: close,
  SET_IS_MOBILE: setIsMobile,
  SET_IS_DESKTOP: setIsDesktop,
  SET_IS_KEYBOARD: setIsKeyboard,
  SET_MODE: setMode,
  TOGGLE_SEGMENTS: toggleSegments,
  TOGGLE_LAYERS: toggleLayers,
  TOGGLE_VIEWPORT_LABEL: toggleViewportLabel
}
