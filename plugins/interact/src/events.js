export function attachEvents ({
  appState,
  mapState,
  pluginState,
  pluginConfig,
  buttonConfig,
  events,
  eventBus,
  handleInteraction,
  closeApp
}) {
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
  eventBus.on(events.MAP_CLICK, handleMapClick)

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
      ...(!coords && selectedFeatures && { selectedFeatures }),
      ...(!coords && selectionBounds && { selectionBounds })
    })

    if (!(pluginConfig.closeOnDone ?? true)) {
      return
    }

    closeApp()
  }
  selectDone.onClick = handleSelectDone

  const handleSelectCancel = () => {
    eventBus.emit('interact:cancel')

    if (!(pluginConfig.closeOnCancel ?? true)) {
      return
    }

    closeApp()
  }
  selectCancel.onClick = handleSelectCancel

  const handleToggleFeature = (args, addToExisting) => {
    mapState.markers.remove('location')

    pluginState.dispatch({
      type: 'TOGGLE_SELECTED_FEATURES',
      payload: {
        multiSelect: pluginConfig.multiSelect,
        addToExisting,
        ...args
      }
    })
  }
  const handleSelect = (args) => handleToggleFeature(args, true)
  const handleUnselect = (args) => handleToggleFeature(args, false)
  eventBus.on('interact:selectFeature', handleSelect)
  eventBus.on('interact:unselectFeature', handleUnselect)

  // Return cleanup function
  return () => {
    selectDone.onClick = null
    selectAtTarget.onClick = null
    selectCancel.onClick = null
    appState.layoutRefs.viewportRef.current?.removeEventListener('keyup', handleKeyup)
    eventBus.off(events.MAP_CLICK, handleMapClick)
    eventBus.off('interact:selectFeature', handleSelect)
    eventBus.off('interact:unselectFeature', handleUnselect)
  }
}