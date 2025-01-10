import { parseCentre, parseZoom } from '../lib/viewport'
import { defaults } from './constants'
import { capabilities } from '../lib/capabilities'
import { actionsMap } from './viewport-actions-map'

const getSize = (framework) => {
  const hasSize = capabilities[framework || 'default'].hasSize
  return (hasSize && window.localStorage.getItem('size')) || 'small'
}

const getBasemap = () => {
  return window.localStorage.getItem('basemap') || 'default'
}

const getBbox = (cz, centre, bbox, srid) => {
  const hasValidCentre = parseCentre(cz, srid) || centre
  return hasValidCentre ? null : bbox || defaults[srid].BBOX
}

const getCentre = (cz, centre, srid) => {
  return parseCentre(cz, srid) || centre || defaults[srid].CENTRE
}

const getZoom = (cz, zoom, minZoom, maxZoom) => {
  const initZoom = parseZoom(cz) || zoom || defaults.ZOOM
  return Math.max(Math.min(initZoom, maxZoom), minZoom)
}

export const initialState = (options) => {
  const { bbox, centre, zoom, place, framework } = options
  const queryParams = new URLSearchParams(window.location.search)
  const cz = queryParams.get('cz')
  const maxZoom = options.maxZoom || defaults.MAX_ZOOM
  const minZoom = options.minZoom || defaults.MIN_ZOOM
  const srid = capabilities[framework || 'default'].srid

  return {
    bbox: getBbox(cz, centre, bbox, srid),
    centre: getCentre(cz, centre, srid),
    zoom: getZoom(cz, zoom, minZoom, maxZoom),
    minZoom,
    maxZoom,
    maxExtent: options.maxExtent || defaults.MAX_BBOX,
    place: !cz ? place : null,
    oZoom: zoom,
    basemap: getBasemap(),
    size: getSize(framework),
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
    hasShortcuts: true,
    padding: null,
    timestamp: Date.now()
  }
}

export const reducer = (state, action) => {
  const { type, payload } = action
  const fn = actionsMap[type]
  if (fn) {
    const actionFunction = fn.bind(this, state, payload)
    return actionFunction()
  }

  return state
}
