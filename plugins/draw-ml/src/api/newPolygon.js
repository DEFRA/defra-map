/**
 * Programmatically edit a feature
 * @param {object} context - plugin context
 * @param {object} feature - A single geoJSON feature
 */
export const newPolygon = ({ appState, appConfig, mapProvider, services }, featureId) => {
  const { map } = mapProvider
  const { draw } = map
  const { eventBus } = services

  if (!draw) {
    return
  }

  // Change mode to draw_vertex
  draw.changeMode('draw_vertex', {
    container: appState.layoutRefs.viewportRef.current,
    vertexMarkerId: `${appConfig.id}-cross-hair`,
    addVertexButtonId: `${appConfig.id}-draw-add-point`,
    interfaceType: appState.interfaceType,
    featureId
  })

  // Emit draw:modechange as draw.changeMode doesnt always do this
  eventBus.emit('draw:modechange', { mode: 'draw_vertex' })

  return () => {
    map.off('draw.modechange', onModeChange)
    map.off('draw.create', onCreate)
  }
}