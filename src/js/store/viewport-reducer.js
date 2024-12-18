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

const getBbox = (cz, centre, bbox) => {
  const hasValidCentre = parseCentre(cz) || centre
  return hasValidCentre ? null : bbox || defaults.BBOX
}

const getCentre = (cz, centre) => {
  return parseCentre(cz) || centre || defaults.CENTRE
}

const getZoom = (cz, zoom, minZoom, maxZoom) => {
  const initZoom = parseZoom(cz) || zoom || defaults.ZOOM
  return Math.max(Math.min(initZoom, maxZoom), minZoom)
}

export const initialState = (options) => {
  const { bbox, centre, zoom, place } = options
  const queryParams = new URLSearchParams(window.location.search)
  const cz = queryParams.get('cz')
  const maxZoom = options.maxZoom || defaults.MAX_ZOOM
  const minZoom = options.minZoom || defaults.MIN_ZOOM

  return {
    bbox: getBbox(cz, centre, bbox),
    centre: getCentre(cz, centre),
    zoom: getZoom(cz, zoom, minZoom, maxZoom),
    minZoom,
    maxZoom,
    maxExtent: options.maxExtent || defaults.MAX_BBOX,
    place: !cz ? place : null,
    oZoom: zoom,
    basemap: getBasemap(),
    size: getSize(options.framework),
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
  const { type, payload } = action
  const fn = actionsMap[type]
  if (fn) {
    const actionFunction = fn.bind(this, state, payload)
    return actionFunction()
  }

  return state
}
