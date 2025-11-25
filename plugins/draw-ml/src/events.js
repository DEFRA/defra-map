export function attachEvents ({ appState, appConfig, mapState, pluginState, mapProvider, buttonConfig, eventBus }) {
  const {
    drawDone,
    drawAddPoint,
    drawUndo,
    drawFinish,
    drawDeletePoint,
    drawSnap,
    drawCancel
  } = buttonConfig

  // --- Button events
  const handleDone = () => {
    console.log('Done')
    eventBus.emit('draw:done', pluginState.feature)
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

  // --- Map events
  const { map } = mapProvider

  const onModeChange = (e) => {
    pluginState.dispatch({ type: 'SET_MODE', payload: e.mode })

    // Switch SimpleSelect to EditVertexMode
    if (e.mode === 'simple_select') {
      map.draw.changeMode('edit_vertex', {
        container: appState.layoutRefs.viewportRef.current,
        deleteVertexButtonId: `${appConfig.id}-draw-delete-point`,
        isPanEnabled: appState.interfaceType !== 'keyboard',
        interfaceType: appState.interfaceType,
        scale: { small: 1, medium: 1.5, large: 2 }[mapState.mapSize],
        featureId: map.draw.getAll().features[0].id
      })
    }
  }
  eventBus.on('draw:modechange', onModeChange)
  map.on('draw.modechange', onModeChange)

  // --- Map style change
  const handleStyleData = (map) => {
    const layers = map.getStyle().layers || []
    if (layers.length === 0 || layers[layers.length - 1].source?.startsWith('mapbox-gl-draw')) {
      return
    }
    layers.filter(l => l.source?.startsWith('mapbox-gl-draw')).forEach(l => map.moveLayer(l.id))
  }
  map.on('styledata', (e) => handleStyleData(map))

  // --- A new shape is created
  const onCreate = (e) => {
    pluginState.dispatch({ type: 'SET_FEATURE', payload: e.features })
    eventBus.emit('draw:create', e)
  }
  map.on('draw.create', onCreate)

  // --- A vertex is selected
  const onVertexSelection = (e) => {
    pluginState.dispatch({ type: 'SET_SELECTED_VERTEX_INDEX', payload: e })
    eventBus.emit('draw:vertexselection', e)
  }
  map.on('draw.vertexselection', onVertexSelection)

  return () => {
    drawDone.onClick = null,
    drawAddPoint.onClick = null,
    drawUndo.onClick = null,
    drawFinish.onClick = null,
    drawDeletePoint.onClick = null,
    drawSnap.onClick = null,
    drawCancel.onClick = null,
    map.off('draw.modechange', onModeChange),
    map.off('styledata', handleStyleData),
    map.off('draw.create', onCreate),
    map.off('draw.vertexselection', onVertexSelection)
  }
}