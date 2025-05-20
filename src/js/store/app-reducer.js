import { parseSegments, parseLayers } from '../lib/query'
import { actionsMap } from './app-actions-map'
import { getStyle, getFeatureShape } from '../lib/viewport'
import { drawTools as defaultDrawTools } from '../store/constants'

const getIsDarkMode = (style, hasAutoMode) => {
  return style === 'dark' || (hasAutoMode && window?.matchMedia('(prefers-color-scheme: dark)').matches)
}

const getActivePanel = (drawMode, info, featureId, targetMarker, legend) => {
  let panel
  if (drawMode === 'default' && info && (featureId || targetMarker)) {
    panel = 'INFO'
  } else if (drawMode === 'default' && legend?.isVisible) {
    panel = legend?.display === 'inset' ? 'LEGEND' : 'KEY'
  } else {
    panel = null
  }
  return panel
}

const parseDrawTools = (tool, tools, defaultTools) => {
  tools = tools ? defaultTools.filter(d => tools.includes(d.id)) : defaultTools
  // Sort tools on order provided by config
  tools = tools.sort((a, b) => { return tools.indexOf(a.id) - tools.indexOf(b.id) })
  // Find valid initial tool or return null
  tool = tools.find(m => m.id === tool) ? tool : null
  return [tool, tools]
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
  const [drawTool, drawTools] = parseDrawTools(options.drawTool, options.drawTools, defaultDrawTools)
  const featureShape = getFeatureShape(query)
  const shape = parseShape(featureShape, drawTool, drawTools)
  const drawMode = drawTool ? defaultDrawTools.find(m => m.id === drawTool).drawMode : 'default'
  const activePanel = getActivePanel(drawMode, info, featureId, targetMarker, legend)

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
    drawMode,
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
