// src/plugins/dataSets/dataSetsInit.jsx
import { useEffect } from 'react'
import { createDataSets } from './dataSets.js'

export function DataSetsInit ({ pluginConfig, appState, mapState, mapProvider, services }) {
  const { events, eventBus } = services

  const isMapStyleReady = !!mapProvider.map?.getStyle()

  useEffect(() => {
    // Don't run init if the app is in non-specified mode
		const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
		const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false

    if (!isMapStyleReady || !inModeWhitelist || inExcludeModes) {
      return
    }

    const dataSets = createDataSets({
			mapStyleId: mapState.mapStyle.id,
      layersConfig: pluginConfig, 
			mapSize: mapState.mapSize,
      mapProvider,
      events,
			eventBus
    })

    return () => {
      dataSets.remove()
    }
    
  }, [isMapStyleReady, appState.mode])

  return null // no UI output, just side effects
}
