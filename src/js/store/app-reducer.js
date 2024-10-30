import { parseSegments, parseLayers, parseQuery } from '../lib/query'

export const initialState = (options) => {
  const { legend, search, info, queryPolygon } = options

  const { featureId, targetMarker } = parseQuery(info)

  let activePanel
  if (info && (featureId || targetMarker)) {
    activePanel = 'INFO'
  } else if (legend?.isVisible) {
    activePanel = ['compact', 'inset'].includes(legend?.display) ? 'LEGEND' : 'KEY'
  }

  return {
    isContainerReady: false,
    search,
    legend,
    info,
    queryPolygon,
    segments: legend ? parseSegments(legend.segments) : null,
    layers: legend?.key ? parseLayers(legend.key, legend.segments) : null,
    featureId,
    targetMarker: !featureId ? targetMarker : null,
    pointerQuery: null,
    activePanel,
    activePanelHasFocus: false,
    hasViewportLabel: false,
    mode: 'default',
    isFrameVisible: false,
    query: null,
    hash: null
  }
}

export const reducer = (state, action) => {
  switch (action.type) {
    case 'CONTAINER_READY':
      return {
        ...state,
        isContainerReady: true
      }
    case 'SET_SEARCH':
      return {
        ...state,
        search: action.data
      }
    case 'SET_INFO':
      return {
        ...state,
        info: action.data,
        activePanel: action.data ? 'INFO' : state.activePanel !== 'INFO' ? state.activePanel : null,
        hasViewportLabel: false
      }
    case 'SET_DRAW':
      return {
        ...state,
        queryPolygon: action.data,
        targetMarker: null
      }
    case 'SET_SELECTED':
      return {
        ...state,
        featureId: action.featureId,
        targetMarker: action.targetMarker,
        activePanel: Object.hasOwn(action, 'activePanel') ? action.activePanel : state.activePanel,
        activePanelHasFocus: action.activePanelHasFocus || state.activePanelHasFocus,
        hash: Date.now()
      }
    case 'ERROR':
      return {
        ...state,
        error: {
          label: action.label,
          message: action.message
        },
        activePanel: 'ERROR',
        hasViewportLabel: false
      }
    case 'OPEN':
      return {
        ...state,
        activePanel: action.data,
        activePanelHasFocus: true,
        hasViewportLabel: false,
        featureId: action.data === 'INFO' ? state.featureId : ''
      }
    case 'CLOSE':
      return {
        ...state,
        featureId: null,
        targetMarker: null,
        activePanel: null
      }
    case 'SET_IS_MOBILE':
      return {
        ...state,
        isMobile: action.value
      }
    case 'SET_IS_DESKTOP':
      return {
        ...state,
        isDesktop: action.value,
        isFixed: state.legend?.position?.includes('fixed') && action.value
      }
    case 'SET_IS_KEYBOARD':
      return {
        ...state,
        isKeyboard: action.value
      }
    case 'SET_MODE':
      return {
        ...state,
        mode: action.value,
        query: Object.hasOwn(action, 'query') ? action.query : state.query,
        isFrameVisible: Object.hasOwn(action, 'isFrameVisible') ? action.isFrameVisible : state.isFrameVisible,
        activePanel: state.mode !== 'draw' && action.value === 'frame' ? 'HELP' : null,
        featureId: null,
        targetMarker: null
      }
    case 'TOGGLE_SEGMENTS':
      return {
        ...state,
        segments: action.segments,
        layers: action.layers,
        featureId: null,
        targetMarker: null
      }
    case 'TOGGLE_LAYERS':
      return {
        ...state,
        layers: action.layers
      }
    case 'TOGGLE_VIEWPORT_LABEL': {
      const hasViewportLabel = action.data && (!state.isMobile || !state.activePanel || state.activePanel === 'LEGEND')
      return {
        ...state,
        hasViewportLabel
      }
    }
    default:
      return state
  }
}
