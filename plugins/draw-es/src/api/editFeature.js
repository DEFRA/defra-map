import { createGraphic, graphicToGeoJSON } from '../graphic.js'

export const editFeature = ({ pluginState, mapState, mapProvider, services }, feature) => {
  const { dispatch } = pluginState
  const { mapStyle } = mapState
  const { sketchViewModel, sketchLayer } = mapProvider
  const { eventBus } = services

  const graphic = createGraphic(feature.id, feature.geometry.coordinates, mapStyle.mapColorScheme)

  sketchLayer.add(graphic)

  // Store initial feature in plugin state
  dispatch({ type: 'SET_FEATURE', payload: feature })

  // Update geojson in state and emit update
  sketchViewModel.on('update', (e) => {
    if (e.state === 'complete') {
      const newFeature = graphicToGeoJSON(e.graphics[0])
      eventBus.emit('draw:update', newFeature)
      dispatch({ type: 'SET_FEATURE', payload: newFeature })
    }
  })

  sketchViewModel.update(graphic, {
    tool: 'reshape',
    toggleToolOnClick: false,
    enableRotation: false,
    enableScaling: false 
  })
}