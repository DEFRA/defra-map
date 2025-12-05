// src/plugins/dataLayers/dataLayersInit.jsx
import { useEffect } from 'react'
import { createDataLayers } from './dataLayers.js'

export function DataLayersInit ({ pluginConfig, appState, mapState, mapProvider, services }) {
  const { eventBus } = services

  useEffect(() => {
    // Don't run init if the app is in non-specified mode
		const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
		const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false

    if (!mapState.isMapReady || !inModeWhitelist || inExcludeModes) {
      return
    }

    const dataLayers = createDataLayers({
			mapStyleId: mapState.mapStyle.id,
      layersConfig: pluginConfig, 
			mapSize: mapState.mapSize,
      mapProvider,
			eventBus
    })

    return () => {
      dataLayers.remove()
    }
    
  }, [mapState.isMapReady, appState.mode])

  return null // no UI output, just side effects
}
