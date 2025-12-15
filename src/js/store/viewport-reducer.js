import { parseCentre, parseZoom, getStyle } from '../lib/viewport'
import { capabilities } from '../lib/capabilities'
import { actionsMap } from './viewport-actions-map'

const getSize = (framework) => {
  const hasSize = capabilities[framework || 'default'].hasSize
  return (hasSize && window.localStorage.getItem('size')) || 'small'
}

const getBounds = (cz, center, bounds, srid) => {
  const hasValidCentre = !!(parseCentre(cz, srid) || center)
  return hasValidCentre ? null : bounds
}

const getCentre = (cz, center, srid) => {
  return parseCentre(cz, srid) || center
}

const getZoom = (cz, zoom, minZoom, maxZoom) => {
  const initZoom = parseZoom(cz) || zoom
  return (minZoom || maxZoom) ? Math.max(Math.min(initZoom, maxZoom), minZoom) : initZoom
}

export const initialState = ({ bounds, extent, center, zoom, maxZoom, minZoom, place, framework, features, styles, queryArea }) => {
  const queryParams = new URLSearchParams(window.location.search)
  const style = getStyle(styles)
  const cz = queryParams.get('cz')
  const srid = capabilities[framework || 'default'].srid
  bounds = getBounds(cz, center, (bounds || extent), srid)
  center = !bounds ? getCentre(cz, center, srid) : undefined
  zoom = getZoom(cz, zoom, minZoom, maxZoom)
  return {
    bounds,
    center,
    zoom,
    resolution: null,
    originalMinZoom: minZoom,
    originalMaxZoom: maxZoom,
    minZoom,
    maxZoom,
    originalStyles: styles,
    styles,
    style,
    dimensions: {},
    place: !cz ? place : null,
    originalZoom: zoom,
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
    timestamp: Date.now(),
    isReady: false
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
