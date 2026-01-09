export const addFrame = ({ pluginState, services }, feature) => {
  const { dispatch } = pluginState
  const { eventBus } = services

  console.log(feature)
  
  // Store initial feature in plugin state
  dispatch({ type: 'SET_FRAME', payload: true })

  eventBus.emit('frame:add')
}