import { parseSegments, parseLayers, parseQuery } from '../lib/query'
import { actionsMap } from './app-actions-map'

export const initialState = (options) => {
  const { legend, search, info, queryPolygon } = options

  const { featureId, targetMarker } = parseQuery(info)

  let activePanel
  if (info && (featureId || targetMarker)) {
    activePanel = 'INFO'
  } else if (legend?.isVisible) {
    activePanel = ['compact', 'inset'].includes(legend?.display) ? 'LEGEND' : 'KEY'
  } else {
    activePanel = null
  }

  return {
    isContainerReady: false,
    search,
    legend,
    info,
    queryPolygon,
    segments: legend && parseSegments(legend.segments),
    layers: legend?.key && parseLayers(legend.key),
    featureId,
    targetMarker: !featureId && targetMarker,
    pointerQuery: null,
    previousPanel: null,
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
  const { type, payload } = action
  const fn = actionsMap[type]
  if (fn) {
    const actionFunction = fn.bind(this, state, payload)
    return actionFunction()
  }

  return state
}
