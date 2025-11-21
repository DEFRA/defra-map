import { useEffect } from 'react'
import { attachEvents } from './events.js'
import { createMapboxDraw } from './mapboxDraw.js'

export const DrawPolygonInit = ({ appConfig, appState, mapState, pluginConfig, pluginState, services, mapProvider, buttonConfig }) => {
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

		// Create drawPolygon
    const drawPolygon = createMapboxDraw({
			container: appState.layoutRefs.viewportRef.current,
			vertexMarkerId: `${appConfig.id}-cross-hair`,
			interfaceType: appState.interfaceType,
			colorScheme: mapState.mapStyle.mapColorScheme,
			featureId: pluginConfig.featureId || 'polygon',
			featureGeoJSON: pluginConfig.featureGeoJSON,
			addVertexButtonId: `${appConfig.id}-draw-polygon-add-point`,
			deleteVertexButtonId: `${appConfig.id}-draw-polygon-delete-point`,
			mapProvider,
			mapSize: mapState.mapSize,
			eventBus
		})

		// Attach events
		const cleanupEvents = attachEvents({
			mapProvider,
			buttonConfig,
			pluginState,
			eventBus
		})

		return () => {
			cleanupEvents
			drawPolygon.remove()
			pluginState.dispatch({ type: 'SET_FEATURE_GEOJSON', payload: null })
		}

  }, [mapState.isMapReady, appState.mode])
}