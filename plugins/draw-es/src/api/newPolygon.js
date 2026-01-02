import { createSymbol, graphicToGeoJSON } from '../graphic.js'

export const newPolygon = ({ mapState, pluginState, mapProvider, services }, featureId) => {
  const { dispatch } = pluginState
  const { sketchViewModel } = mapProvider
  const { eventBus } = services

  // One time event listener
  const handleCreateComplete = sketchViewModel.on('create', (e) => {
    if (e.state === 'complete') {
      e.graphic.attributes = { id: featureId }
      
      // Immediately enter update mode on the newly created graphic
      sketchViewModel.update(e.graphic, {
        tool: 'reshape',
        toggleToolOnClick: false
      })

      // Store geojson in state and emit create
      const newFeature = graphicToGeoJSON(e.graphic)
      eventBus.emit('draw:create', newFeature)
      dispatch({ type: 'SET_FEATURE', payload: newFeature })

      handleCreateComplete.remove()
    }
  })

  sketchViewModel.polygonSymbol = createSymbol(mapState.mapStyle.mapColorScheme)
  sketchViewModel.create('polygon')
}