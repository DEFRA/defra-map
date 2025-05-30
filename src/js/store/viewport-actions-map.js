import { getDescription, getStatus, getPlace } from '../lib/viewport'
import { isSame } from '../lib/utils'
import { margin } from './constants'

const ready = (state, payload) => {
  const attributions = state.style?.attribution ? [state.style.attribution] : payload.attributions
  return {
    ...state,
    zoom: payload.zoom,
    resolution: payload.resolution,
    attributions
  }
}

const update = (state, payload) => {
  const { oPlace, originalZoom, isUserInitiated, action } = state
  const { bounds, center, zoom, features } = payload
  const place = getPlace(isUserInitiated, action, oPlace, state.place)
  const original = { oBbox: bounds, oCentre: center, rZoom: zoom, originalZoom, oPlace: place }
  const isBoundsChange = !isSame(state.bounds, bounds)
  const isUpdate = ['GEOLOC', 'DATA'].includes(action) || isBoundsChange
  const status = getStatus(action, isBoundsChange, place, state, payload)
  const newAction = isBoundsChange && action === 'SEARCH' && !isUserInitiated ? 'SEARCH' : null
  const attributions = state.style?.attribution ? [state.style.attribution] : payload.attributions
  return {
    ...state,
    ...(['INIT', 'GEOLOC'].includes(action) && original),
    place,
    bounds,
    center,
    zoom,
    features,
    status,
    isUpdate,
    isMoving: false,
    isStatusVisuallyHidden: true,
    action: newAction,
    attributions
  }
}

const updatePlace = (state, payload) => {
  const { bounds, features } = state
  let status = getDescription(payload, bounds, features)
  status = status ? String(status[0]).toUpperCase() + String(status).slice(1) : status

  return {
    ...state,
    place: payload,
    status,
    isUserInitiated: false,
    isStatusVisuallyHidden: true
  }
}

const moveStart = (state, payload) => {
  return {
    ...state,
    status: '',
    isMoving: true,
    isUpdate: false,
    isUserInitiated: payload,
    isStatusVisuallyHidden: true,
    hasShortcuts: true,
    action: null
  }
}

const move = (state, payload) => {
  const attributions = state.style?.attribution ? [state.style.attribution] : payload.attributions
  return {
    ...state,
    isMaxZoom: payload.isMaxZoom,
    isMinZoom: payload.isMinZoom,
    resolution: payload.resolution,
    attributions
  }
}

const reset = (state) => {
  return {
    ...state,
    place: state.oPlace,
    action: 'RESET',
    isUpdate: false
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
    isUpdate: false,
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
    status: '',
    isStatusVisuallyHidden: true,
    action: 'GEOLOC',
    isUpdate: false
  }
}

const zoomIn = (state) => {
  return {
    ...state,
    action: 'ZOOM_IN',
    isUserInitiated: true,
    isUpdate: false
  }
}

const zoomOut = (state) => {
  return {
    ...state,
    action: 'ZOOM_OUT',
    isUserInitiated: true,
    isUpdate: false
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
    isUpdate: false,
    style: newStyle,
    attributions
  }
}

const swapStyles = (state, payload = {}) => {
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
    isUpdate: false,
    minZoom: minZoom || state.originalMinZoom,
    maxZoom: maxZoom || state.originalMaxZoom,
    styles: styles || state.originalStyles,
    style
  }
}

const setSize = (state, payload) => {
  return {
    ...state,
    action: 'SIZE',
    isUpdate: false,
    padding: null,
    size: payload
  }
}

const clearStatus = (state) => {
  return {
    ...state,
    status: '',
    isStatusVisuallyHidden: false
  }
}

const clearFeatures = (state) => {
  const status = state.action === 'SEARCH' ? state.status : null

  return {
    ...state,
    features: null,
    status,
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

const clear = (state) => {
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
  SWAP_STYLES: swapStyles,
  SET_SIZE: setSize,
  CLEAR: clear,
  CLEAR_STATUS: clearStatus,
  CLEAR_FEATURES: clearFeatures,
  SET_PADDING: setPadding,
  TOGGLE_SHORTCUTS: toggleShortcuts
}
