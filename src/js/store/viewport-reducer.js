import { parseCentre, parseZoom, getBasemap } from '../lib/viewport'
import { defaults } from './constants'
import { capabilities } from '../lib/capabilities'
import { actionsMap } from './viewport-actions-map'

const getSize = (framework) => {
  const hasSize = capabilities[framework || 'default'].hasSize
  return (hasSize && window.localStorage.getItem('size')) || 'small'
}

const getBounds = (cz, center, bounds, srid) => {
  const hasValidCentre = !!(parseCentre(cz, srid) || center)
  return hasValidCentre ? null : bounds || defaults[srid].BOUNDS
}

const getCentre = (cz, center, srid) => {
  return parseCentre(cz, srid) || center || defaults[srid].CENTER
}

const getZoom = (cz, zoom, minZoom, maxZoom) => {
  const initZoom = parseZoom(cz) || zoom || defaults.ZOOM
  return Math.max(Math.min(initZoom, maxZoom), minZoom)
}

export const initialState = ({ bounds, extent, center, zoom, maxZoom, minZoom, place, framework, features, styles }) => {
  const queryParams = new URLSearchParams(window.location.search)
  const cz = queryParams.get('cz')
  const srid = capabilities[framework || 'default'].srid
  maxZoom = maxZoom || defaults.MAX_ZOOM
  minZoom = minZoom || defaults.MIN_ZOOM
  bounds = getBounds(cz, center, (bounds || extent), srid)
  center = !bounds ? getCentre(cz, center, srid) : null
  zoom = getZoom(cz, zoom, minZoom, maxZoom)

  return {
    bounds,
    center,
    zoom,
    minZoom,
    maxZoom,
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
