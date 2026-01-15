export const addFeature = ({ mapProvider, services }, feature) => {
  const { draw } = mapProvider
  const { eventBus } = services

  if (!draw) {
    return
  }

  // --- Add feature to draw instance
  draw.add(feature)

  // Display only, not for editing
  draw.changeMode('disabled')

  eventBus.emit('draw:add', feature)
}