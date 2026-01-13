export const editFeature = ({ pluginState, services }, feature) => {
  const { dispatch } = pluginState
  const { eventBus } = services
  
  // Store initial feature in plugin state
  dispatch({ type: 'SET_FRAME', payload: {} })

  eventBus.emit('frame:edit')
}