export function attachEvents ({ pluginState, mapProvider, buttonConfig, eventBus }) {
  const {
    drawPolygonDone,
    drawPolygonAddPoint,
    drawPolygonUndo,
    drawPolygonFinish,
    drawPolygonDeletePoint,
    drawPolygonSnap,
    drawPolygonCancel
  } = buttonConfig

  const { featureGeoJSON } = pluginState

  // Button events

  const handleDone = () => {
    console.log('Done')
    eventBus.emit('app:polygondone', featureGeoJSON)
  }
  drawPolygonDone.onClick = handleDone

  const handleCancel = () => {
    console.log('Cancel')
    eventBus.emit('drawpolygon:cancel')
  }
  drawPolygonCancel.onClick = handleCancel

  const handleSnap = () => {
    pluginState.dispatch({ type: 'TOGGLE_SNAP' })
  }
  drawPolygonSnap.onClick = handleSnap

  // Plugin events

  const handlePolygonModeChange = (e) => pluginState.dispatch({ type: 'SET_MODE', payload: e.mode })
  eventBus.on('drawpolygon:modechange', handlePolygonModeChange)

  const handlePolygonCreate = (e) => pluginState.dispatch({ type: 'SET_FEATURE_GEOJSON', payload: e.features })
  eventBus.on('drawpolygon:create', handlePolygonCreate)

  const handlePolygonVertexSelection = (e) => pluginState.dispatch({ type: 'SET_SELECTED_VERTEX_INDEX', payload: e })
  eventBus.on('drawpolygon:vertexselection', handlePolygonVertexSelection)

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
    drawPolygonDone.onClick = null,
    drawPolygonAddPoint.onClick = null,
    drawPolygonUndo.onClick = null,
    drawPolygonFinish.onClick = null,
    drawPolygonDeletePoint.onClick = null,
    drawPolygonSnap.onClick = null,
    drawPolygonCancel.onClick = null
    eventBus.off('drawpolygon:modechange', handlePolygonModeChange)
    eventBus.off('drawpolygon:create', handlePolygonCreate)
    eventBus.off('drawpolygon:vertexselection', handlePolygonVertexSelection)
  }
}