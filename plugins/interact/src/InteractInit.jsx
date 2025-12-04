import { useEffect } from 'react'
import { useInteractionHandlers } from './hooks/useInteractionHandlers.js'
import { useHighlightSync } from './hooks/useHighlightSync.js'
import { attachEvents } from './events.js'

export const InteractInit = ({
  appState,
  mapState,
  services,
  buttonConfig,
  mapProvider,
  pluginConfig,
  pluginState
}) => {
  const { interfaceType } = appState
  const { dataLayers } = pluginConfig
  const { dispatch, selectedFeatures, selectionBounds } = pluginState
  const { eventBus, closeApp } = services
  const { crossHair, mapStyle } = mapState

  const isTouchOrKeyboard = ['touch', 'keyboard'].includes(interfaceType)

  // Core interaction logic (click > select/marker)
  const { handleInteraction } = useInteractionHandlers({
    appState,
    mapState,
    pluginConfig,
    pluginState,
    services,
    mapProvider,
  })

  // Highlight feaytures and sync state selectedBounds from mapProvider
  useHighlightSync({
    mapProvider,
    mapStyle,
    dataLayers,
    selectedFeatures,
    selectionBounds,
    dispatch,
    eventBus
  })

  // Toggle target marker visibility
  useEffect(() => {
    if (isTouchOrKeyboard) {
      crossHair.fixAtCenter()
    } else {
      crossHair.hide()
    }
  }, [interfaceType])

  useEffect(() => {
    const cleanupEvents = attachEvents({
      appState,
      pluginState,
      pluginConfig,
      mapState,
      buttonConfig,
      eventBus,
      handleInteraction,
      closeApp
    })
    
    return cleanupEvents
  }, [appState, mapState, pluginState, buttonConfig, eventBus, handleInteraction])


  return null
}
