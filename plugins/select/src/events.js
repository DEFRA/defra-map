export function attachEvents ({ appState, mapState, pluginState, pluginConfig, buttonConfig, eventBus, handleInteraction }) {
  const {
    selectDone,
    selectAtTarget,
    selectCancel
  } = buttonConfig

  const handleKeyup = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSelectAtTarget()
    }
  }
  appState.layoutRefs.viewportRef.current?.addEventListener('keyup', handleKeyup)

  const handleMapClick = (e) => {
    if (appState.interfaceType === 'mouse') {
      handleInteraction(e)
    }
  }
  eventBus.on('map:click', handleMapClick)

  const handleSelectAtTarget = () => {
    handleInteraction(mapState.targetMarker.getDetail())
  }
  selectAtTarget.onClick = handleSelectAtTarget
  
  const handleSelectDone = () => {
    const marker = mapState.markers.getMarker('location')
    const { coords } = marker || {}
    const { selectionBounds, selectedFeatures } = pluginState
    
    eventBus.emit('select:done', {
      ...(coords && { coords }),
      ...(selectionBounds && { selectionBounds }),
      ...(selectedFeatures && { selectedFeatures })
    })
  }
  selectDone.onClick = handleSelectDone

  const handleSelectCancel = () => {
    eventBus.emit('select:cancel')
  }
  selectCancel.onClick = handleSelectCancel

  const handleSelectFeatures = (args) => {
    mapState.markers.remove('location')

    console.log(args)

    pluginState.dispatch({
      type: 'TOGGLE_SELECTED_FEATURES',
      payload: {
        multiSelect: pluginConfig.multiSelect,
        addToExisting: true,
        ...args
      }
    })
  }
  eventBus.on('select:selectFeatures', handleSelectFeatures)

  // Return cleanup function
  return () => {
    selectDone.onClick = null
    selectAtTarget.onClick = null
    selectCancel.onClick = null
    appState.layoutRefs.viewportRef.current?.removeEventListener('keyup', handleKeyup)
    eventBus.off('map:click', handleMapClick)
    eventBus.off('select:selectFeatures', handleSelectFeatures)
  }
}