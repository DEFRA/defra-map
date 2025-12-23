import { useEffect } from 'react'
import { createSketchViewModel } from './sketchViewModel.js'
import { attachEvents } from './events.js'

export const DrawInit = ({ appState, mapState, pluginConfig, pluginState, services, mapProvider, buttonConfig }) => {
	const { eventBus } = services

	useEffect(() => {
		// Don't run init if the app is in non-specified mode
		const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
		const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false

		if (!mapState.isMapReady || !inModeWhitelist || inExcludeModes) {
			return
		}

		attachEvents({ pluginState, mapProvider, eventBus })

    if (mapProvider.sketchViewModel && mapProvider.sketchLayer) {
      return
    }
		
		// Create sketchViewModel instance
    const { sketchViewModel, sketchLayer } = createSketchViewModel({
			pluginState,
			mapProvider,
			eventBus
		})

		// Store instances on the mapProvider
		mapProvider.sketchViewModel = sketchViewModel
		mapProvider.sketchLayer = sketchLayer

		// Draw ready
		eventBus.emit('draw:ready')

		// return () => {
		// 	cleanupEvents
		// 	remove()
		// }

  }, [mapState.isMapReady, mapState.mapStyle, appState.mode, pluginState.feature])
}