import { parseCentre, parseZoom, getStyle } from '../lib/viewport'
import { actionsMap } from './viewport-actions-map'

const getSize = (hasSizeCapability) => {
  return (hasSizeCapability && window.localStorage.getItem('size')) || 'small'
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

export const initialState = ({ hasSizeCapability, srid, bounds, extent, center, zoom, maxZoom, minZoom, place, features, styles }) => {
  const queryParams = new URLSearchParams(window.location.search)
  const style = getStyle(styles)
  const cz = queryParams.get('cz')
  bounds = getBounds(cz, center, (bounds || extent), srid)
  center = !bounds ? getCentre(cz, center, srid) : undefined
  zoom = getZoom(cz, zoom, minZoom, maxZoom)
  return {
    bounds,
    center,
    zoom,
    originalMinZoom: minZoom,
    originalMaxZoom: maxZoom,
    minZoom,
    maxZoom,
    isMaxZoom: zoom >= maxZoom,
    isMinZoom: zoom < -minZoom,
    originalStyles: styles,
    styles,
    style,
    place: !cz ? place : null,
    originalZoom: zoom,
    size: getSize(hasSizeCapability),
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
