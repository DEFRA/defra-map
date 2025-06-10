import { getPlace, parseDimensions } from '../lib/viewport'
import { isSame } from '../lib/utils'
import { margin } from './constants'

const ready = (state, payload) => {
  const attributions = state.style?.attribution ? [state.style.attribution] : payload.attributions
  const zoom = payload.zoom
  return {
    ...state,
    zoom,
    currentZoom: zoom,
    resolution: payload.resolution,
    attributions,
    isReady: !state.style?.url || zoom
  }
}

const update = (state, payload) => {
  const { oPlace, originalZoom, isUserInitiated, action } = state
  const { bounds, focusBounds, center, zoom, features, label } = payload
  console.log(center, bounds)
  const place = getPlace(isUserInitiated, action, oPlace, state.place)
  const original = { oBbox: bounds, oCentre: center, rZoom: zoom, originalZoom, oPlace: place }
  const isBoundsChange = !isSame(state.bounds, bounds)
  const isUrlUpdate = ['GEOLOC', 'DATA'].includes(action) || isBoundsChange
  const attributions = state.style?.attribution ? [state.style.attribution] : payload.attributions
  const dimensions = payload.dimensions ? parseDimensions(payload.dimensions) : {}
  const isDrawValid = state.drawMaxArea ? payload.dimensions?.area <= state.drawMaxArea : true

  return {
    ...state,
    ...(['INIT', 'GEOLOC'].includes(action) && original),
    place,
    bounds,
    focusBounds,
    center,
    zoom,
    features,
    isNewStatus: true,
    isUrlUpdate,
    isMoving: false,
    isStatusVisuallyHidden: true,
    attributions,
    dimensions,
    isDrawValid,
    label
  }
}

const updatePlace = (state, payload) => {
  return {
    ...state,
    action: 'GEOCODE',
    place: payload,
    isNewStatus: true,
    isUserInitiated: false,
    isStatusVisuallyHidden: true
  }
}

const moveStart = (state, payload) => {
  return {
    ...state,
    isMoving: true,
    isUrlUpdate: false,
    isUserInitiated: payload,
    isStatusVisuallyHidden: true,
    hasShortcuts: true,
    action: state.action || 'MOVE'
  }
}

const move = (state, payload) => {
  const { isMaxZoom, isMinZoom, zoom, resolution } = payload
  const attributions = state.style?.attribution ? [state.style.attribution] : payload.attributions
  const currentZoom = zoom
  const dimensions = payload.dimensions ? parseDimensions(payload.dimensions) : {}
  const isDrawValid = state.drawMaxArea ? payload.dimensions?.area <= state.drawMaxArea : true

  return {
    ...state,
    isMaxZoom,
    isMinZoom,
    currentZoom,
    resolution,
    attributions,
    dimensions,
    isDrawValid
  }
}

const reset = (state) => {
  return {
    ...state,
    place: state.oPlace,
    action: 'RESET',
    isUrlUpdate: false
  }
}

const search = (state, payload) => {
  return {
    ...state,
    bounds: payload.bounds,
    center: payload.center,
    zoom: payload.zoom,
    place: payload.place,
    action: 'SEARCH',
    isStatusVisuallyHidden: true,
    isUrlUpdate: false,
    padding: null,
    timestamp: Date.now()
  }
}

const geoloc = (state, payload) => {
  return {
    ...state,
    place: payload.place,
    center: payload.center,
    bounds: null,
    isStatusVisuallyHidden: true,
    action: 'GEOLOC',
    isUrlUpdate: false
  }
}

const zoomIn = (state) => {
  return {
    ...state,
    action: 'ZOOM_IN',
    isUserInitiated: true,
    isUrlUpdate: false
  }
}

const zoomOut = (state) => {
  return {
    ...state,
    action: 'ZOOM_OUT',
    isUserInitiated: true,
    isUrlUpdate: false
  }
}

const setStyle = (state, payload) => {
  const { style, colourScheme } = payload
  const defaultName = colourScheme === 'light' && style === 'dark' && 'default'
  const darkName = colourScheme === 'dark' && style === 'default' && 'dark'
  const styleName = defaultName || darkName || style
  const newStyle = state.styles.find(s => s.name === styleName)
  const attributions = newStyle.attribution ? [newStyle.attribution] : []
  return {
    ...state,
    action: 'STYLE',
    isUrlUpdate: false,
    style: newStyle,
    attributions
  }
}

const toggleConstraints = (state, payload = {}) => {
  const { styles, minZoom, maxZoom } = payload
  const styleName = state.style.name
  let style
  if (styles?.length) {
    style = styles?.find(s => s.name === styleName) || styles[0]
  } else {
    style = state.originalStyles.find(s => s.name === styleName) || state.originalStyles[0]
  }
  return {
    ...state,
    action: 'STYLE',
    isUrlUpdate: false,
    minZoom: minZoom || state.originalMinZoom,
    maxZoom: maxZoom || state.originalMaxZoom,
    styles: styles || state.originalStyles,
    style,
    dimensions: {},
    isDrawValid: !state.drawMaxArea
  }
}

const setSize = (state, payload) => {
  return {
    ...state,
    action: 'SIZE',
    isUrlUpdate: false,
    padding: null,
    size: payload
  }
}

const clearFeatures = (state) => {
  return {
    ...state,
    features: null,
    action: 'DATA'
  }
}

const setPadding = (state, payload) => {
  const { panel, viewport, isMobile, isAnimate } = payload
  let padding = null
  const pRect = panel?.getBoundingClientRect()
  if (pRect?.height > 0) {
    const vRect = viewport.getBoundingClientRect()
    const oHeight = pRect.bottom - vRect.top
    const oWidth = pRect.right - vRect.left
    const isPortrait = viewport.offsetHeight / oHeight > viewport.offsetWidth / oWidth
    const top = isPortrait ? Math.round(pRect.height) + margin.TOP : 0
    const left = isPortrait ? 0 : Math.round(pRect.width) + margin.LEFT
    padding = {
      ...isMobile ? { bottom: margin.BOTTOM + pRect.height } : {},
      ...isPortrait && !isMobile ? { top } : {},
      ...!isPortrait && !isMobile ? { left } : {}
    }
  }
  return {
    ...state,
    isAnimate,
    padding
  }
}

const toggleShortcuts = (state, payload) => {
  return {
    ...state,
    hasShortcuts: payload
  }
}

const resetStatus = (state) => {
  return {
    ...state,
    isNewStatus: false,
    action: null
  }
}

const clearAltFeature = (state) => {
  return {
    ...state,
    hasShortcuts: false,
    isVertexEdit: false
  }
}

export const actionsMap = {
  READY: ready,
  UPDATE: update,
  UPDATE_PLACE: updatePlace,
  MOVE_START: moveStart,
  MOVE: move,
  RESET: reset,
  SEARCH: search,
  GEOLOC: geoloc,
  ZOOM_IN: zoomIn,
  ZOOM_OUT: zoomOut,
  SET_STYLE: setStyle,
  TOGGLE_CONSTRAINTS: toggleConstraints,
  SET_SIZE: setSize,
  CLEAR_ALT_FEATURE: clearAltFeature,
  CLEAR_FEATURES: clearFeatures,
  SET_PADDING: setPadding,
  TOGGLE_SHORTCUTS: toggleShortcuts,
  RESET_STATUS: resetStatus
}
