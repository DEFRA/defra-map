import { parseCentre, parseZoom, getDescription, getBoundsChange, setBasemap } from '../lib/viewport'
import { isSame } from '../lib/utils'
import { settings } from './constants'

export const initialState = (options) => {
  const { bbox, centre, zoom, place } = options
  const queryParams = new URLSearchParams(window.location.search)
  const cz = queryParams.get('cz')
  const colorSchemeMQ = '(prefers-color-scheme: dark)'
  const isDarkMode = window?.matchMedia(colorSchemeMQ).matches

  return {
    bbox: cz ? null : bbox || (centre && zoom ? null : settings.map.BBOX),
    centre: cz ? parseCentre(cz) : centre || null,
    zoom: cz ? parseZoom(cz) : zoom || null,
    place: cz ? null : place,
    oZoom: zoom,
    basemap: setBasemap(isDarkMode),
    size: window.localStorage.getItem('size'),
    features: null,
    status: '',
    isStatusVisuallyHidden: true,
    error: null,
    action: 'INIT',
    isMoving: false,
    isUpdate: false,
    isFeaturesChange: false,
    isPanZoomChange: false,
    isUserInitiated: false,
    padding: null,
    timestamp: Date.now()
  }
}

export const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE': {
      const { oPlace, oZoom } = state
      const { bbox, centre, zoom, features } = action.detail
      const place = !state.isUserInitiated ? state.action === 'RESET' ? oPlace : state.place : null
      const description = getDescription(place, centre, bbox, features)
      const original = { oBbox: bbox, oCentre: centre, rZoom: zoom, oZoom, oPlace: place }
      const isPanZoom = !(isSame(state.centre, centre) && isSame(state.zoom, zoom))
      const isGeoLoc = state.action === 'GEOLOC'
      const isFeaturesChange = !(isSame(state.features, features))
      const isUpdate = isPanZoom || isGeoLoc || isFeaturesChange
      const direction = getBoundsChange(state.centre, state.zoom, centre, zoom, bbox)
      const status = isPanZoom || isGeoLoc ? place ? description : direction : state.status
      return {
        ...state,
        ...(['INIT', 'GEOLOC'].includes(state.action) && original),
        place,
        bbox,
        centre,
        zoom,
        status,
        features,
        isMoving: false,
        isFeaturesChange: isPanZoom || isGeoLoc,
        isUpdate,
        action: null
      }
    }
    case 'UPDATE_PLACE': {
      const { centre, bbox, features } = state
      const { place } = action
      const description = getDescription(place, centre, bbox, features)
      return {
        ...state,
        place,
        status: description,
        isUserInitiated: false,
        isStatusVisuallyHidden: true
      }
    }
    case 'MOVE_START': {
      return {
        ...state,
        status: 'Map move',
        isMoving: true,
        isUpdate: false,
        isUserInitiated: action.isUserInitiated,
        isStatusVisuallyHidden: true
      }
    }
    case 'RESET': {
      return {
        ...state,
        place: state.oPlace,
        action: 'RESET',
        isUpdate: false
      }
    }
    case 'SEARCH': {
      return {
        ...state,
        bbox: action.bbox,
        centre: action.centre,
        zoom: action.zoom,
        place: action.place,
        action: 'SEARCH',
        isStatusVisuallyHidden: true,
        isUpdate: false,
        padding: null,
        timestamp: Date.now()
      }
    }
    case 'GEOLOC': {
      return {
        ...state,
        place: action.place,
        centre: action.centre,
        bbox: null,
        status: '',
        isStatusVisuallyHidden: true,
        action: 'GEOLOC',
        isUpdate: false
      }
    }
    case 'ZOOM_IN': {
      return {
        ...state,
        action: 'ZOOM_IN',
        isUpdate: false
      }
    }
    case 'ZOOM_OUT': {
      return {
        ...state,
        action: 'ZOOM_OUT',
        isUpdate: false
      }
    }
    case 'SET_BASEMAP': {
      return {
        ...state,
        action: 'BASEMAP',
        isUpdate: false,
        basemap: action.basemap
      }
    }
    case 'SET_SIZE': {
      return {
        ...state,
        action: 'SIZE',
        isUpdate: false,
        padding: null,
        size: action.size
      }
    }
    case 'UPDATE_STATUS': {
      return {
        ...state,
        status: action.status,
        isStatusVisuallyHidden: action.isStatusVisuallyHidden
      }
    }
    case 'CLEAR_STATUS': {
      return {
        ...state,
        status: '',
        isStatusVisuallyHidden: false
      }
    }
    case 'CLEAR_FEATURES': {
      return {
        ...state,
        features: null
      }
    }
    case 'SET_PADDING': {
      const { panel, viewport, isMobile, isAnimate } = action
      let padding = null
      const pRect = panel?.getBoundingClientRect()
      if (pRect?.height > 0) {
        const vRect = viewport.getBoundingClientRect()
        const oHeight = pRect.bottom - vRect.top
        const oWidth = pRect.right - vRect.left
        const isPortrait = viewport.offsetHeight / oHeight > viewport.offsetWidth / oWidth
        const top = isPortrait ? Math.round(pRect.height) + 90 : 0
        const left = isPortrait ? 0 : Math.round(pRect.width) + 70
        padding = {
          ...isMobile ? { bottom: 15 + pRect.height } : {},
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
    default:
      return state
  }
}
