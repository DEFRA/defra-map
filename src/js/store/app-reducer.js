import { parseSegments, parseLayers } from '../lib/query'
import { actionsMap } from './app-actions-map'
import { getStyle, isFeatureSquare } from '../lib/viewport'
import { drawModes } from '../store/constants'

const getIsDarkMode = (style, hasAutoMode) => {
  return style === 'dark' || (hasAutoMode && window?.matchMedia('(prefers-color-scheme: dark)').matches)
}

const getActivePanel = (mode, info, featureId, targetMarker, legend) => {
  let panel
  if (mode === 'default' && info && (featureId || targetMarker)) {
    panel = 'INFO'
  } else if (mode === 'default' && legend?.isVisible) {
    panel = ['compact', 'inset'].includes(legend?.display) ? 'LEGEND' : 'KEY'
  } else {
    panel = null
  }
  return panel
}

export const initialState = (options) => {
  const { styles, legend, search, info, queryArea, hasAutoMode } = options
  const style = getStyle(styles)
  const featureId = info?.featureId || options.featureId
  const targetMarker = info?.coord ? { coord: info.coord, hasData: info.hasData } : null

  let drawMode = options.drawMode
  let mode = drawMode ? drawModes.find(m => m.shape === drawMode).mode : 'default'
  const query = queryArea?.feature

  if (drawMode && query) {
    drawMode = isFeatureSquare(query) ? 'square' : 'polygon'
    mode = isFeatureSquare(query) ? 'frame' : 'vertex'
  }

  const activePanel = getActivePanel(mode, info, featureId, targetMarker, legend)

  return {
    isContainerReady: false,
    search,
    legend,
    info,
    queryArea,
    segments: legend && parseSegments(legend.segments),
    layers: legend && parseLayers(legend.key),
    isKeyExpanded: false,
    isDarkMode: getIsDarkMode(style?.name, hasAutoMode),
    hasAutoMode,
    featureId,
    targetMarker: !featureId && targetMarker,
    pointerQuery: null,
    previousPanel: null,
    activePanel,
    activePanelHasFocus: false,
    hasViewportLabel: false,
    mode,
    drawMode,
    isFrameVisible: false,
    isTargetVisible: false,
    query,
    hash: 1
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
