import { useCallback } from 'react'
import { getFeaturesAtPoint, findMatchingFeature, buildLayerConfigMap } from '../utils/featureQueries.js'

export const useInteractionHandlers = ({
  mapState,
  pluginConfig,
  pluginState,
  services,
  mapProvider,
}) => {
  const { locationMarkers } = mapState
  const { dataLayers, selectionMode = 'marker', multiSelect, markerColor } = pluginConfig
  const { dispatch } = pluginState
  const { eventBus } = services

  const layerConfigMap = buildLayerConfigMap(dataLayers)

  const handleInteraction = useCallback(
    ({ point, coords }) => {
      const allFeatures = getFeaturesAtPoint(mapProvider, point)
      const hasDataLayers = dataLayers.length > 0

      const match =
        hasDataLayers &&
        (selectionMode === 'select' || selectionMode === 'auto')
          ? findMatchingFeature(allFeatures, layerConfigMap)
          : null

      if (match) {
        locationMarkers.remove('location')

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

        eventBus.emit('select:feature', {
          coords,
          selectedFeature: feature,
          allFeatures,
        })

        return
      }

      // Marker mode
      if (selectionMode === 'marker' || (selectionMode === 'auto' && hasDataLayers)) {
        dispatch({ type: 'CLEAR_SELECTED_FEATURES' })
        locationMarkers.add('location', {
          color: markerColor,
          coords
        })

        eventBus.emit('select:confirm', { coords, allFeatures })
      }
    }, [
      mapProvider,
      dataLayers,
      selectionMode,
      multiSelect,
      eventBus,
      dispatch,
      locationMarkers
    ]
  )

  return {
    handleInteraction
  }
}
