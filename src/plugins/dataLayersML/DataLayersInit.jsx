// src/plugins/dataLayers/dataLayersInit.jsx
import { useEffect } from 'react'
import { createDataLayers } from './dataLayers.js'

export function DataLayersInit ({ pluginConfig, pluginState, appState, mapState, mapProvider, services }) {
  const { eventBus } = services

  useEffect(() => {
    // Don't run init if the app is in non-specified mode
		const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
		const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false

    if (!mapState.isMapReady || !inModeWhitelist || inExcludeModes) {
      return
    }

    eventBus.on('search:open', () => {
      appState.dispatch({ type: 'CLOSE_PANEL', payload: 'dataLayers' })
    })

    eventBus.on('search:close', () => {
      // appState.dispatch({ type: 'RESTORE_PREVIOUS_PANELS' })
    })

    createDataLayers({
			mapStyleId: mapState.mapStyle.id,
      layersConfig: pluginConfig, 
			mapSize: mapState.mapSize,
      mapProvider,
			eventBus
    })

    return () => {
      eventBus.off('search:open')
      eventBus.off('search:close')
    }
  }, [mapState.isMapReady, appState.mode])

  return null // no UI output, just side effects
}
