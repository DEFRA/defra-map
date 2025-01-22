import { parseSegments, parseLayers } from '../lib/query'
import { getBasemap } from '../lib/utils'
import { actionsMap } from './app-actions-map'

const getIsDarkMode = (basemap, hasAutoMode) => {
  return basemap === 'dark' || (hasAutoMode && window?.matchMedia('(prefers-color-scheme: dark)').matches)
}

const getActivePanel = (info, featureId, targetMarker, legend) => {
  let panel
  if (info && (featureId || targetMarker)) {
    panel = 'INFO'
  } else if (legend?.isVisible) {
    panel = ['compact', 'inset'].includes(legend?.display) ? 'LEGEND' : 'KEY'
  } else {
    panel = null
  }
  return panel
}

export const initialState = (options) => {
  const { legend, search, info, styles, queryPolygon, hasAutoMode } = options
  const featureId = info?.featureId || options.featureId
  const targetMarker = info?.coord ? { coord: info.coord, hasData: info.hasData } : null
  const activePanel = getActivePanel(info, featureId, targetMarker, legend)
  const basemap = getBasemap(styles)

  return {
    isContainerReady: false,
    search,
    legend,
    info,
    queryPolygon,
    segments: legend && parseSegments(legend.segments),
    layers: legend?.key && parseLayers(legend.key),
    isKeyExpanded: false,
    isDarkMode: getIsDarkMode(basemap, hasAutoMode),
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
