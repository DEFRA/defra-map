import { parseCentre, parseZoom, getStyle } from '../lib/viewport'
import { actionsMap } from './viewport-actions-map'
import { defaults } from '../store/constants'

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
  let initZoom = parseZoom(cz) || zoom
  initZoom = minZoom && initZoom ? Math.max(minZoom, initZoom) : initZoom
  initZoom = maxZoom && initZoom ? Math.min(maxZoom, initZoom) : initZoom
  return initZoom
}

export const initialState = ({ hasSizeCapability, srid, bounds, extent, center, zoom, maxZoom, minZoom, place, features, styles, draw }) => {
  const queryParams = new URLSearchParams(window.location.search)
  const style = getStyle(styles)
  const cz = queryParams.get('cz')
  bounds = getBounds(cz, center, (bounds || extent), srid)
  center = !bounds ? getCentre(cz, center, srid) : undefined
  zoom = getZoom(cz, zoom, minZoom, maxZoom) || defaults.ZOOM

  return {
    bounds,
    focusBounds: null,
    center,
    zoom,
    currentZoom: zoom,
    resolution: null,
    originalMinZoom: minZoom,
    originalMaxZoom: maxZoom,
    minZoom,
    maxZoom,
    isMaxZoom: zoom >= maxZoom,
    isMinZoom: zoom < -minZoom,
    originalStyles: styles,
    styles,
    style,
    attributions: [],
    dimensions: {},
    place: !cz ? place : null,
    originalZoom: zoom,
    size: getSize(hasSizeCapability),
    features,
    isNewStatus: false,
    isStatusVisuallyHidden: true,
    error: null,
    action: 'INIT',
    isMoving: false,
    isUrlUpdate: false,
    isFeaturesChange: false,
    isPanZoomChange: false,
    isUserInitiated: false,
    isReady: false,
    hasShortcuts: true,
    padding: null,
    drawMaxArea: draw?.maxArea,
    isDrawValid: !draw?.maxArea,
    label: null,
    status: null,
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
