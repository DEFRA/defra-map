import { handleSetMapStyle } from './handleSetMapStyle.js'
import { addMapLayers } from './mapLayers.js'

export const createDataSets = ({
  layersConfig,
  mapStyleId,
  mapProvider,
  events,
  eventBus
}) => {
  const { map } = mapProvider
  const { layers } = layersConfig

  // Initialize all layers once
  layers.forEach(layer => {
    addMapLayers(map, mapStyleId, layer)
  })

  // Handle style changes
  const styleHandler = handleSetMapStyle({
    map,
    events,
    eventBus,
    layers,
    mapStyleId
  })

  return {
    remove() {
      eventBus.off(events.MAP_SET_STYLE, styleHandler)
      
      // Clean up sources and layers
      layers.forEach(layer => {
        const sourceId = `${layer.id}-source`
        const fillLayerId = layer.fill ? layer.id : null
        const strokeLayerId = layer.stroke ? (layer.fill ? `${layer.id}-stroke` : layer.id) : null
        
        if (strokeLayerId && map.getLayer(strokeLayerId)) {
          map.removeLayer(strokeLayerId)
        }

        if (fillLayerId && map.getLayer(fillLayerId)) {
          map.removeLayer(fillLayerId)
        }
        
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId)
        }
      })
    }
  }
}