import { parseCentre, parseZoom, getBasemap } from '../lib/viewport'
import { defaults } from './constants'
import { capabilities } from '../lib/capabilities'
import { actionsMap } from './viewport-actions-map'

const getSize = (framework) => {
  const hasSize = capabilities[framework || 'default'].hasSize
  return (hasSize && window.localStorage.getItem('size')) || 'small'
}

const getBbox = (cz, center, bounds, srid) => {
  const hasValidCentre = parseCentre(cz, srid) || center
  return hasValidCentre ? null : bounds || defaults[srid].BBOX
}

const getCentre = (cz, center, srid) => {
  return parseCentre(cz, srid) || center || defaults[srid].CENTRE
}

const getZoom = (cz, zoom, minZoom, maxZoom) => {
  const initZoom = parseZoom(cz) || zoom || defaults.ZOOM
  return Math.max(Math.min(initZoom, maxZoom), minZoom)
}

export const initialState = (options) => {
  const { bounds, center, zoom, place, framework, features, styles } = options
  const queryParams = new URLSearchParams(window.location.search)
  const cz = queryParams.get('cz')
  const maxZoom = options.maxZoom || defaults.MAX_ZOOM
  const minZoom = options.minZoom || defaults.MIN_ZOOM
  const srid = capabilities[framework || 'default'].srid

  return {
    bounds: getBbox(cz, center, bounds, srid),
    center: getCentre(cz, center, srid),
    zoom: getZoom(cz, zoom, minZoom, maxZoom),
    minZoom,
    maxZoom,
    maxBounds: options.maxBounds || defaults.MAX_BOUNDS,
    place: !cz ? place : null,
    oZoom: zoom,
    basemap: getBasemap(styles),
    size: getSize(framework),
    features,
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
