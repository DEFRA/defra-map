import { handleSetMapStyle } from './handleSetMapStyle.js'
import { addMapLayers } from './mapLayers.js'

export const createDataLayers = ({
  layersConfig,
  mapStyleId,
  mapProvider,
  eventBus
}) => {
  const { map } = mapProvider
  const { layers } = layersConfig

  // Initialize all layers once
  console.log(layers)
  layers.forEach(layer => {
    addMapLayers(map, mapStyleId, layer)
  })

  // Handle style changes
  const styleHandler = handleSetMapStyle({
    map,
    eventBus,
    layers,
    mapStyleId
  })

  return {
    remove() {
      eventBus.off('map:setmapstyle', styleHandler)
      
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