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
    hasViewportLabel: false,
    hash: state.hash + 1
  }
}

const setSelected = (state, payload) => {
  return {
    ...state,
    featureId: payload.featureId,
    targetMarker: payload.targetMarker,
    activePanelHasFocus: payload.activePanelHasFocus || state.activePanelHasFocus,
    hash: state.hash + (payload.featureId ? 1 : 0)
  }
}

const setBanner = (state, payload) => {
  return {
    ...state,
    banner: payload
  }
}

const setNextSelected = (state, payload) => {
  let featureId = state.featureId
  const { key, features } = payload
  if (features.length) {
    const current = features.findIndex(f => f.id === featureId) || 0
    const total = features.length
    const down = current === total - 1 ? 0 : current + 1
    const up = current > 0 ? current - 1 : total - 1
    let nextIndex = key === 'PageDown' ? down : up
    nextIndex = nextIndex < features.length ? nextIndex : 0
    featureId = features[nextIndex]?.id || features[0]?.id
  }
  return {
    ...state,
    featureId,
    activePanel: null
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
    featureId: payload === 'INFO' ? state.featureId : '',
    hash: state.hash + 1
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
    drawMode: payload.value || state.drawMode,
    query: Object.hasOwn(payload, 'query') ? payload.query : state.query,
    shape: Object.hasOwn(payload, 'shape') ? payload.shape : state.shape,
    activePanel: state.activePanel === 'EDIT' ? state.activePanel : null,
    featureId: null,
    targetMarker: null
  }
}

const setIsDarkMode = (state, payload) => {
  const { style, colourScheme } = payload
  const { hasAutoMode } = state
  const isDarkMode = style?.name === 'dark' || (hasAutoMode && colourScheme === 'dark')
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
  ERROR: error,
  OPEN: open,
  CLOSE: close,
  SET_MODE: setMode,
  SET_SELECTED: setSelected,
  SET_BANNER: setBanner,
  SET_NEXT_SELECTED: setNextSelected,
  SET_IS_DARK_MODE: setIsDarkMode,
  SET_IS_TARGET_VISIBLE: setIsTargetVisible,
  TOGGLE_SEGMENTS: toggleSegments,
  TOGGLE_LAYERS: toggleLayers,
  TOGGLE_KEY_EXPANDED: toggleKeyExpanded,
  TOGGLE_VIEWPORT_LABEL: toggleViewportLabel
}
