import { getDescription, getStatus, getPlace } from '../lib/viewport'
import { isSame } from '../lib/utils'
import { margin } from './constants'

const update = (state, payload) => {
  const { oPlace, oZoom, isUserInitiated, action } = state
  const { bounds, center, zoom, features } = payload
  const place = getPlace(isUserInitiated, action, oPlace, state.place)
  const original = { oBbox: bounds, oCentre: center, rZoom: zoom, oZoom, oPlace: place }
  const isPanZoom = !(isSame(state.center, center) && isSame(state.zoom, zoom))
  const isUpdate = ['GEOLOC', 'DATA'].includes(action) || isPanZoom
  const status = getStatus(action, isPanZoom, place, state, payload)
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
    action: null
  }
}

const updatePlace = (state, payload) => {
  const { center, bounds, features } = state
  const status = getDescription(payload, center, bounds, features)
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
    status: 'Map move',
    isMoving: true,
    isUpdate: false,
    isUserInitiated: payload,
    isStatusVisuallyHidden: true,
    hasShortcuts: true
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
    isUpdate: false
  }
}

const zoomOut = (state) => {
  return {
    ...state,
    action: 'ZOOM_OUT',
    isUpdate: false
  }
}

const setBasemap = (state, payload) => {
  let { basemap, colourScheme } = payload
  if (colourScheme === 'light' && basemap === 'dark') {
    basemap = 'default'
  }
  if (colourScheme === 'dark' && basemap === 'default') {
    basemap = 'dark'
  }
  return {
    ...state,
    action: 'BASEMAP',
    isUpdate: false,
    basemap
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
  return {
    ...state,
    features: null,
    status: '',
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

export const actionsMap = {
  UPDATE: update,
  UPDATE_PLACE: updatePlace,
  MOVE_START: moveStart,
  RESET: reset,
  SEARCH: search,
  GEOLOC: geoloc,
  ZOOM_IN: zoomIn,
  ZOOM_OUT: zoomOut,
  SET_BASEMAP: setBasemap,
  SET_SIZE: setSize,
  CLEAR_STATUS: clearStatus,
  CLEAR_FEATURES: clearFeatures,
  SET_PADDING: setPadding,
  TOGGLE_SHORTCUTS: toggleShortcuts
}
