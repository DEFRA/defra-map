import { parseCentre, parseZoom, setBasemap } from '../lib/viewport'
import { settings, capabilities } from './constants'
import { actionsMap } from './viewport-actions-map'

const getSize = (providerName) => {
  const hasSize = capabilities[providerName || 'default'].HAS_SIZE
  return hasSize && window.localStorage.getItem('size')
}

export const initialState = (options) => {
  const { bbox, centre, zoom, place } = options
  const queryParams = new URLSearchParams(window.location.search)
  const cz = queryParams.get('cz')
  const colorSchemeMQ = '(prefers-color-scheme: dark)'
  const isDarkMode = window?.matchMedia(colorSchemeMQ).matches
  const initBbox = bbox || (centre && zoom ? null : settings.map.BBOX)

  return {
    bbox: cz ? null : initBbox,
    centre: cz ? parseCentre(cz) : centre || null,
    zoom: cz ? parseZoom(cz) : zoom || null,
    place: cz ? null : place,
    oZoom: zoom,
    basemap: setBasemap(isDarkMode),
    size: getSize(options.provider.name),
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
