import { createGraphic, graphicToGeoJSON } from '../graphic.js'

export const editFeature = ({ pluginState, mapState, mapProvider }, feature) => {
  const { dispatch } = pluginState
  const { mapStyle } = mapState
  const { sketchViewModel, sketchLayer } = mapProvider

  const graphic = createGraphic(feature.id, feature.geometry.coordinates, mapStyle.mapColorScheme)

  sketchLayer.add(graphic)

  // Store initial feature in plugin state
  dispatch({ type: 'SET_FEATURE', payload: feature })

  // Listen for updates
  sketchViewModel.on('update', (e) => {
    if (e.state === 'complete') {
      const newFeature = graphicToGeoJSON(e.graphics[0])
      dispatch({ type: 'SET_FEATURE', payload: newFeature })
    }
  })

  // Disable deselection when clicking outside the shape

  sketchViewModel.update(graphic, {
    tool: 'reshape',
    toggleToolOnClick: false,
    enableRotation: false,
    enableScaling: false 
  })
}