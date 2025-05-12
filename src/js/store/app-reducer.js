import { parseSegments, parseLayers } from '../lib/query'
import { actionsMap } from './app-actions-map'
import { getStyle, getFeatureShape } from '../lib/viewport'
import { drawModes as defaultDrawModes } from '../store/constants'

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
  let drawModes = modes ? defaultModes.filter(d => modes.includes(d.id)) : defaultModes
  // Sort drawModes on order provide by options
  drawModes = modes ? drawModes.sort((a, b) => { return modes.indexOf(a.id) - modes.indexOf(b.id) }) : drawModes
  const drawMode = drawModes.find(m => m.id === mode) ? mode : null
  return [drawMode, drawModes]
}

const parseShape = (featureShape, drawMode, drawModes) => {
  const polygon = (drawMode === 'polygon' && featureShape === 'square') || (featureShape === 'square' && !drawModes.find(m => m.id === 'square')) ? 'polygon' : null
  return polygon || featureShape || drawMode || 'square'
}

export const initialState = (options) => {
  const { styles, legend, search, info, banner, queryArea, hasAutoMode } = options
  const style = getStyle(styles)
  const featureId = info?.featureId || options.featureId
  const targetMarker = info?.coord ? { coord: info.coord, hasData: info.hasData } : null
  const query = queryArea?.feature
  const [drawMode, drawModes] = parseDrawModes(options.drawMode, options.drawModes, defaultDrawModes)
  const featureShape = getFeatureShape(query)
  const shape = parseShape(featureShape, drawMode, drawModes)
  const mode = drawMode ? defaultDrawModes.find(m => m.id === drawMode).mode : 'default'
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
    drawMode,
    drawModes,
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
