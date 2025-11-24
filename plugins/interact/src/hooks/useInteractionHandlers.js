import { useCallback } from 'react'
import { getFeaturesAtPoint, findMatchingFeature, buildLayerConfigMap } from '../utils/featureQueries.js'

export const useInteractionHandlers = ({
  mapState,
  pluginConfig,
  pluginState,
  services,
  mapProvider,
}) => {
  const { markers } = mapState
  const { dataLayers, interactionMode = 'marker', multiSelect, markerColor } = pluginConfig
  const { dispatch } = pluginState
  const { eventBus } = services

  const layerConfigMap = buildLayerConfigMap(dataLayers)

  const handleInteraction = useCallback(
    ({ point, coords }) => {
      const allFeatures = getFeaturesAtPoint(mapProvider, point)
      const hasDataLayers = dataLayers.length > 0

      const match =
        hasDataLayers &&
        (interactionMode === 'select' || interactionMode === 'auto')
          ? findMatchingFeature(allFeatures, layerConfigMap)
          : null

      if (match) {
        markers.remove('location')

        const { feature, config } = match
        const featureId = feature.properties?.[config.idProperty]

        if (featureId) {
          dispatch({
            type: 'TOGGLE_SELECTED_FEATURES',
            payload: {
              featureId,
              multiSelect,
              layerId: config.layerId,
              idProperty: config.idProperty,
            },
          })
        }

        eventBus.emit('interact:feature', {
          coords,
          selectedFeature: feature,
          allFeatures,
        })

        return
      }

      // Marker mode
      if (interactionMode === 'marker' || (interactionMode === 'auto' && hasDataLayers)) {
        dispatch({ type: 'CLEAR_SELECTED_FEATURES' })
        markers.add('location', coords, { color: markerColor })

        eventBus.emit('interact:confirm', { coords, allFeatures })
      }
    }, [
      mapProvider,
      dataLayers,
      interactionMode,
      multiSelect,
      eventBus,
      dispatch,
      markers
    ]
  )

  return {
    handleInteraction
  }
}
