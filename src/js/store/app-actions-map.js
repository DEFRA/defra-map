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

const close = (state) => {
  // Restore previous panel if it wasn't an info or legend
  const activePanel = state.previousPanel !== 'INFO' ? state.previousPanel : null
  return {
    ...state,
    featureId: null,
    targetMarker: null,
    previousPanel: null,
    activePanelHasFocus: !activePanel,
    isKeyExpanded: false,
    activePanel
  }
}

const setMode = (state, payload) => {
  return {
    ...state,
    mode: payload.value || state.mode,
    query: Object.hasOwn(payload, 'query') ? payload.query : state.query,
    activePanel: null,
    featureId: null,
    targetMarker: null
  }
}

const setIsDarkMode = (state, payload) => {
  const { basemap, colourScheme } = payload
  const isDarkMode = basemap === 'dark' || colourScheme === 'dark'
  return {
    ...state,
    isDarkMode
  }
}

const setIsTargetVisible = (state, payload) => {
  return {
    ...state,
    isTargetVisible: payload
  }
}

const toggleSegments = (state, payload) => {
  return {
    ...state,
    segments: payload.segments,
    layers: payload.layers,
    featureId: null,
    targetMarker: null,
    isKeyExpanded: false
  }
}

const toggleLayers = (state, payload) => {
  return {
    ...state,
    layers: payload
  }
}

const toggleKeyExpanded = (state, payload) => {
  return {
    ...state,
    isKeyExpanded: payload
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
  SET_MODE: setMode,
  SET_IS_DARK_MODE: setIsDarkMode,
  SET_IS_TARGET_VISIBLE: setIsTargetVisible,
  TOGGLE_SEGMENTS: toggleSegments,
  TOGGLE_LAYERS: toggleLayers,
  TOGGLE_KEY_EXPANDED: toggleKeyExpanded,
  TOGGLE_VIEWPORT_LABEL: toggleViewportLabel
}
