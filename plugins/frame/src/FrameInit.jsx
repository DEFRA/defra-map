import { useEffect } from 'react'

export const FrameInit = ({ 
  appState, 
  mapState, 
  pluginConfig, 
  pluginState, 
  services,
  buttonConfig 
}) => {
  const { eventBus } = services
  const { frameDone, frameCancel } = buttonConfig
  const { dispatch } = pluginState

  // Check if plugin should be active
  const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
  const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false
  const isActive = mapState.isMapReady && inModeWhitelist && !inExcludeModes

  // Attach events
  useEffect(() => {
    if (!isActive) {
			return
		}

    frameDone.onClick = () => {
      dispatch({ type: 'SET_FRAME', payload: null })
      eventBus.emit('frame:done', {})
    }

    frameCancel.onClick = () => {
      dispatch({ type: 'SET_FRAME', payload: null })
      eventBus.emit('frame:cancel')
    }

    return () => {
      frameDone.onClick = null
      frameCancel.onClick = null
    }
  }, [mapState.isMapReady, appState.mode, appState.breakpoint])
}