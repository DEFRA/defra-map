export function attachEvents ({ pluginState, mapProvider, buttonConfig, eventBus }) {
  const {
    drawDone,
    drawAddPoint,
    drawUndo,
    drawFinish,
    drawDeletePoint,
    drawSnap,
    drawCancel
  } = buttonConfig

  const { featureGeoJSON } = pluginState

  // Button events

  const handleDone = () => {
    console.log('Done')
    eventBus.emit('app:polygondone', featureGeoJSON)
  }
  drawDone.onClick = handleDone

  const handleCancel = () => {
    console.log('Cancel')
    eventBus.emit('draw:cancel')
  }
  drawCancel.onClick = handleCancel

  const handleSnap = () => {
    pluginState.dispatch({ type: 'TOGGLE_SNAP' })
  }
  drawSnap.onClick = handleSnap

  // Plugin events

  const handlePolygonModeChange = (e) => pluginState.dispatch({ type: 'SET_MODE', payload: e.mode })
  eventBus.on('draw:modechange', handlePolygonModeChange)

  const handlePolygonCreate = (e) => pluginState.dispatch({ type: 'SET_FEATURE_GEOJSON', payload: e.features })
  eventBus.on('draw:create', handlePolygonCreate)

  const handlePolygonVertexSelection = (e) => pluginState.dispatch({ type: 'SET_SELECTED_VERTEX_INDEX', payload: e })
  eventBus.on('draw:vertexselection', handlePolygonVertexSelection)

  // Map events

  const handleStyleData = (map) => {
    const layers = map.getStyle().layers || []
    if (layers.length === 0 || layers[layers.length - 1].source?.startsWith('mapbox-gl-draw')) {
      return
    }
    layers.filter(l => l.source?.startsWith('mapbox-gl-draw')).forEach(l => map.moveLayer(l.id))
  }
  const { map } = mapProvider
  map.on('styledata', (e) => handleStyleData(map))

  return () => {
    drawDone.onClick = null,
    drawAddPoint.onClick = null,
    drawUndo.onClick = null,
    drawFinish.onClick = null,
    drawDeletePoint.onClick = null,
    drawSnap.onClick = null,
    drawCancel.onClick = null
    eventBus.off('draw:modechange', handlePolygonModeChange)
    eventBus.off('draw:create', handlePolygonCreate)
    eventBus.off('draw:vertexselection', handlePolygonVertexSelection)
  }
}