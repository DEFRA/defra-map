export const removeFrame = ({ pluginState, services }) => {
  const { dispatch } = pluginState
  const { eventBus } = services
  
  // Store initial feature in plugin state
  dispatch({ type: 'SET_FRAME', payload: false })

  eventBus.emit('frame:remove')
}