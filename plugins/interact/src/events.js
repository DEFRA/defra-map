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

  // Allow tapping on touch devices as well as accurate placement
  const handleMapClick = (e) => {
    handleInteraction(e)
  }
  eventBus.on('map:click', handleMapClick)

  const handleSelectAtTarget = () => {
    handleInteraction(mapState.crossHair.getDetail())
  }
  selectAtTarget.onClick = handleSelectAtTarget
  
  const handleSelectDone = () => {
    const marker = mapState.markers.getMarker('location')
    const { coords } = marker || {}
    const { selectionBounds, selectedFeatures } = pluginState
    
    eventBus.emit('interact:done', {
      ...(coords && { coords }),
      ...(selectionBounds && { selectionBounds }),
      ...(selectedFeatures && { selectedFeatures })
    })
  }
  selectDone.onClick = handleSelectDone

  const handleSelectCancel = () => {
    eventBus.emit('interact:cancel')
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
  eventBus.on('interact:selectFeatures', handleSelectFeatures)

  // Return cleanup function
  return () => {
    selectDone.onClick = null
    selectAtTarget.onClick = null
    selectCancel.onClick = null
    appState.layoutRefs.viewportRef.current?.removeEventListener('keyup', handleKeyup)
    eventBus.off('map:click', handleMapClick)
    eventBus.off('interact:selectFeatures', handleSelectFeatures)
  }
}