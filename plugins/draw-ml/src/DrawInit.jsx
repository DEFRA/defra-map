import { useEffect } from 'react'
import { attachEvents } from './events.js'
import { createMapboxDraw } from './mapboxDraw.js'

export const DrawInit = ({ appState, appConfig, mapState, pluginConfig, pluginState, services, mapProvider, buttonConfig }) => {
	const { eventBus } = services

	useEffect(() => {
		// Don't run init if the app is in non-specified mode
		const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
		const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false

    if (!mapState.isMapReady || !inModeWhitelist || inExcludeModes) {
      return
    }

		console.log(pluginState.mode, appState.interfaceType)

		// Attach provider.map and plugin events before mapbox-gl-draw instance is created
		const cleanupEvents = attachEvents({
			appState,
			appConfig,
			mapState,
			mapProvider,
			buttonConfig,
			pluginState,
			eventBus
		})

		// Create draw
    const { remove } = createMapboxDraw({
			colorScheme: mapState.mapStyle.mapColorScheme,
			mapProvider,
			eventBus
		})

		// Draw ready
		eventBus.emit('draw:ready')

		return () => {
			cleanupEvents
			remove()
		}

  }, [mapState.isMapReady, appState.mode])
}