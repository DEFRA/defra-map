import { getDescription, getStatus, getPlace, getBoundsChange } from '../lib/viewport'
import { isSame } from '../lib/utils'
import { margin } from './constants'

const update = (state, payload) => {
  const { oPlace, oZoom, isUserInitiated, action } = state
  const { bbox, centre, zoom, features, label } = payload
  const place = getPlace(isUserInitiated, action, oPlace, state.place)
  const description = getDescription(place, centre, bbox, features)
  const original = { oBbox: bbox, oCentre: centre, rZoom: zoom, oZoom, oPlace: place }
  const panZoom = !(isSame(state.centre, centre) && isSame(state.zoom, zoom)) && 'PANZOOM'
  const updateAction = (action === 'GEOLOC' && 'GEOLOC') || (action === 'DATA' && 'DATA') || panZoom || null
  const direction = getBoundsChange(state.centre, state.zoom, centre, zoom, bbox)
  const status = getStatus(updateAction, place, description, direction, label)
  return {
    ...state,
    ...(['INIT', 'GEOLOC'].includes(action) && original),
    place,
    bbox,
    centre,
    zoom,
    status,
    features,
    isMoving: false,
    isUpdate: !!updateAction,
    action: null
  }
}

const updatePlace = (state, payload) => {
  const { centre, bbox, features } = state
  const status = getDescription(payload, centre, bbox, features)
  return {
    ...state,
    place: payload,
    status,
    isUserInitiated: false,
    isStatusVisuallyHidden: true
  }
}

const updateStatus = (state, payload) => {
  return {
    ...state,
    status: payload.status,
    isStatusVisuallyHidden: payload.isStatusVisuallyHidden
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
    bbox: payload.bbox,
    centre: payload.centre,
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
    centre: payload.centre,
    bbox: null,
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
  UPDATE_STATUS: updateStatus,
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
