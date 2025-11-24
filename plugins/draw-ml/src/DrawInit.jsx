import { useEffect } from 'react'
import { attachEvents } from './events.js'
import { createMapboxDraw } from './mapboxDraw.js'

export const DrawInit = ({ appConfig, appState, mapState, pluginConfig, pluginState, services, mapProvider, buttonConfig }) => {
	const { eventBus } = services

	// Set initial featureGeoJSON
	useEffect(() => {
		pluginState.dispatch({ type: 'INIT_STATE', payload: pluginConfig })
	}, [])

	useEffect(() => {
		// Don't run init if the app is in non-specified mode
		const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
		const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false

    if (!mapState.isMapReady || !inModeWhitelist || inExcludeModes) {
      return
    }

		// Attach provider.map and plugin events before mapbox-gl-draw instance is created
		const cleanupEvents = attachEvents({
			mapProvider,
			buttonConfig,
			pluginState,
			eventBus
		})

		// Create draw
    const draw = createMapboxDraw({
			container: appState.layoutRefs.viewportRef.current,
			vertexMarkerId: `${appConfig.id}-cross-hair`,
			interfaceType: appState.interfaceType,
			colorScheme: mapState.mapStyle.mapColorScheme,
			featureId: pluginState.featureId || 'polygon',
			featureGeoJSON: pluginState.featureGeoJSON,
			addVertexButtonId: `${appConfig.id}-draw-add-point`,
			deleteVertexButtonId: `${appConfig.id}-draw-delete-point`,
			mapSize: mapState.mapSize,
			mapProvider,
			eventBus
		})

		return () => {
			cleanupEvents
			draw.remove()
			pluginState.dispatch({ type: 'SET_FEATURE_GEOJSON', payload: null })
		}

  }, [mapState.isMapReady, appState.mode])
}