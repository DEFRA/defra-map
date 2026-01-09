import { graphicToGeoJSON } from '../graphic.js'

export const editFeature = ({ pluginState, mapProvider, services }, featureId) => {
  const { dispatch } = pluginState
  const { sketchViewModel, sketchLayer } = mapProvider
  const { eventBus } = services

  // Graphic must already exist on sketchLayer
  const graphic = sketchLayer.graphics.items.find(g => g.attributes.id === featureId)

  // Fit view to extent of feature
  const extent = graphic.geometry.extent
  const bounds = [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
  mapProvider.fitToBounds(bounds)

  // Update temp feature in state and emit update event
  sketchViewModel.on('update', (e) => {
    if (e.state === 'complete') {
      const tempFeature = graphicToGeoJSON(e.graphics[0])
      eventBus.emit('draw:update', tempFeature)
      dispatch({ type: 'SET_FEATURE', payload: { tempFeature }})
    }
  })

  // Enter update mode
  sketchViewModel.layer = sketchLayer
  sketchViewModel.update(graphic, {
    tool: 'reshape',
    toggleToolOnClick: false,
    enableRotation: false,
    enableScaling: false 
  })

  dispatch({ type: 'SET_MODE', payload: 'edit-feature' })
}