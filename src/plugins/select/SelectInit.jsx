import { useEffect } from 'react'
import { useInteractionHandlers } from './hooks/useInteractionHandlers'
import { useHighlightSync } from './hooks/useHighlightSync'
import { attachEvents } from './events.js'

export const SelectInit = ({
  appState,
  mapState,
  services,
  buttonConfig,
  mapProvider,
  pluginConfig,
  pluginState,
}) => {
  const { interfaceType } = appState
  const { dataLayers } = pluginConfig
  const { dispatch, selectedFeatures, selectionBounds } = pluginState
  const { eventBus } = services
  const { targetMarker, mapStyle } = mapState

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

  useHighlightSync({
    mapProvider,
    mapStyle,
    dataLayers,
    selectedFeatures,
    selectionBounds,
    dispatch,
  })

  // Toggle target marker visibility
  useEffect(() => {
    if (isTouchOrKeyboard) {
      targetMarker.fixAtCenter()
    } else {
      targetMarker.hide()
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
      handleInteraction
    })
    
    return cleanupEvents
  }, [appState, mapState, pluginState, buttonConfig, eventBus, handleInteraction])


  return null
}
