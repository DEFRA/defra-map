/**
 * Programmatically edit a feature
 * @param {object} context - plugin context
 * @param {object} feature - A single geoJSON feature
 */
export const editFeature = ({ appState, appConfig, mapState, mapProvider, services }, feature) => {
  const { map, draw } = mapProvider
  const { eventBus } = services

  if (!draw) {
    return
  }

  // --- Add feature to draw instance
  draw.add(feature)

  // --- Change mode to edit_vertex
  draw.changeMode('edit_vertex', {
    container: appState.layoutRefs.viewportRef.current,
    deleteVertexButtonId: `${appConfig.id}-draw-delete-point`,
    isPanEnabled: appState.interfaceType !== 'keyboard',
    interfaceType: appState.interfaceType,
    scale: { small: 1, medium: 1.5, large: 2 }[mapState.mapSize],
    featureId: feature.properties?.id || feature.id
  })

  // Emit draw:modechange as draw.changeMode doesnt always do this
  eventBus.emit('draw:modechange', { mode: 'edit_vertex' })

  return () => {
    map.off('draw.vertexselection', onVertexSelection)
  }
}