import { parseSegments, parseLayers } from '../lib/query'
import { actionsMap } from './app-actions-map'

const getIsDarkMode = (hasAutoMode) => {
  const basemap = window.localStorage.getItem('basemap')
  return basemap === 'dark' || (hasAutoMode && window?.matchMedia('(prefers-color-scheme: dark)').matches)
}

export const initialState = (options) => {
  const { legend, search, info, queryPolygon, hasAutoMode } = options

  const featureId = info?.featureId
  const targetMarker = info?.coord ? { coord: info.coord, hasData: info.hasData } : null

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
    isKeyExpanded: false,
    isDarkMode: getIsDarkMode(hasAutoMode),
    hasAutoMode,
    featureId,
    targetMarker: !featureId && targetMarker,
    pointerQuery: null,
    previousPanel: null,
    activePanel,
    activePanelHasFocus: false,
    hasViewportLabel: false,
    mode: 'default',
    isFrameVisible: false,
    isTargetVisible: false,
    query: queryPolygon?.feature,
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
