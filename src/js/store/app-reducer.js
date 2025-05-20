import { parseSegments, parseLayers } from '../lib/query'
import { actionsMap } from './app-actions-map'
import { getStyle, getFeatureShape } from '../lib/viewport'
import { drawTools as defaultDrawModes } from '../store/constants'

const getIsDarkMode = (style, hasAutoMode) => {
  return style === 'dark' || (hasAutoMode && window?.matchMedia('(prefers-color-scheme: dark)').matches)
}

const getActivePanel = (mode, info, featureId, targetMarker, legend) => {
  let panel
  if (mode === 'default' && info && (featureId || targetMarker)) {
    panel = 'INFO'
  } else if (mode === 'default' && legend?.isVisible) {
    panel = legend?.display === 'inset' ? 'LEGEND' : 'KEY'
  } else {
    panel = null
  }
  return panel
}

const parseDrawModes = (mode, modes, defaultModes) => {
  let drawTools = modes ? defaultModes.filter(d => modes.includes(d.id)) : defaultModes
  // Sort drawTools on order provide by options
  drawTools = modes ? drawTools.sort((a, b) => { return modes.indexOf(a.id) - modes.indexOf(b.id) }) : drawTools
  const drawTool = drawTools.find(m => m.id === mode) ? mode : null
  return [drawTool, drawTools]
}

const parseShape = (featureShape, drawTool, drawTools) => {
  const polygon = (drawTool === 'polygon' && featureShape === 'square') || (featureShape === 'square' && !drawTools.find(m => m.id === 'square')) ? 'polygon' : null
  return polygon || featureShape || drawTool || 'square'
}

export const initialState = (options) => {
  const { styles, legend, search, info, banner, queryArea, hasAutoMode } = options
  const style = getStyle(styles)
  const featureId = info?.featureId || options.featureId
  const targetMarker = info?.coord ? { coord: info.coord, hasData: info.hasData } : null
  const query = queryArea?.feature
  const [drawTool, drawTools] = parseDrawModes(options.drawTool, options.drawTools, defaultDrawModes)
  const featureShape = getFeatureShape(query)
  const shape = parseShape(featureShape, drawTool, drawTools)
  const mode = drawTool ? defaultDrawModes.find(m => m.id === drawTool).mode : 'default'
  const activePanel = getActivePanel(mode, info, featureId, targetMarker, legend)

  return {
    isContainerReady: false,
    search,
    legend,
    info,
    banner,
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
    drawTool,
    drawTools,
    shape,
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
