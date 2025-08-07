import { parseSegments, parseLayers } from '../lib/query'
import { actionsMap } from './app-actions-map'
import { getStyle, getFeatureShape } from '../lib/viewport'
import { drawTools as defaultDrawTools } from '../store/constants'

const getIsDarkMode = (style, hasAutoMode) => {
  return style === 'dark' || (hasAutoMode && window?.matchMedia('(prefers-color-scheme: dark)').matches)
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

const parseDrawTools = (tools, defaultTools) => {
  // Remove invalid tools
  let validTools = tools ? defaultTools.filter(d => tools.includes(d.id)) : defaultTools
  // Sort tools on order provided by config if any
  validTools = validTools.sort((a, b) => { return tools?.indexOf(a.id) - tools?.indexOf(b.id) })
  return validTools
}

export const initialState = (options) => {
  const { styles, legend, search, info, queryArea, hasAutoMode, feature } = options
  const drawTools = queryArea?.drawTools
  const style = getStyle(styles)
  const featureId = info?.featureId || options.featureId
  const targetMarker = info?.coord ? { coord: info.coord, hasData: info.hasData } : null
  const activePanel = getActivePanel(info, featureId, targetMarker, legend)
  const featureShape = getFeatureShape(feature)
  const shape = featureShape

  return {
    isContainerReady: false,
    search,
    legend,
    info,
    queryArea,
    segments: legend && parseSegments(legend.segments),
    layers: legend?.key && parseLayers(legend.key),
    isKeyExpanded: false,
    isDrawMenuExpanded: queryArea?.collapse !== 'collapse',
    isDarkMode: getIsDarkMode(style.name, hasAutoMode),
    hasAutoMode,
    featureId,
    targetMarker: !featureId && targetMarker,
    pointerQuery: null,
    previousPanel: null,
    activePanel,
    activePanelHasFocus: false,
    previousPanel: null,
    hasViewportLabel: false,
    mode: 'default',
    drawTools: parseDrawTools(drawTools, defaultDrawTools),
    shape,
    isFrameVisible: false,
    isTargetVisible: false,
    query: queryArea?.feature,
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
