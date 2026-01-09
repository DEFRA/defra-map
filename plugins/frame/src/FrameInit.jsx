import { useEffect } from 'react'

export const FrameInit = ({ 
  appState, 
  mapState, 
  pluginConfig, 
  pluginState, 
  services, 
  mapProvider, 
  buttonConfig 
}) => {
  const { eventBus } = services

  // Check if plugin should be active
  const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
  const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false
  const isActive = mapState.isMapReady && inModeWhitelist && !inExcludeModes

  // Initialize sketch components once
  useEffect(() => {
    if (!isActive) {
			return
		}
  }, [mapState.isMapReady, appState.mode])
}