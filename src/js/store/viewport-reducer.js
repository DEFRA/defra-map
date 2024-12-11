import { parseCentre, parseZoom } from '../lib/viewport'
import { settings } from './constants'
import { capabilities } from '../lib/capabilities'
import { actionsMap } from './viewport-actions-map'

const getSize = (framework) => {
  const hasSize = capabilities[framework || 'default'].hasSize
  return (hasSize && window.localStorage.getItem('size')) || 'small'
}

const getBasemap = () => {
  return window.localStorage.getItem('basemap') || 'default'
}

export const initialState = (options) => {
  const { bbox, centre, zoom, place } = options
  const queryParams = new URLSearchParams(window.location.search)
  const cz = queryParams.get('cz')
  const initBbox = bbox || (centre && zoom ? null : settings.map.BBOX)

  return {
    bbox: cz ? null : initBbox,
    centre: cz ? parseCentre(cz) : centre || null,
    zoom: cz ? parseZoom(cz) : zoom || null,
    place: cz ? null : place,
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
