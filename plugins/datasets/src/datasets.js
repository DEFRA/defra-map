import { handleSetMapStyle } from './handleSetMapStyle.js'
import { addMapLayers } from './mapLayers.js'

export const createDatasets = ({
  pluginConfig,
  pluginStateRef,
  mapStyleId,
  mapProvider,
  events,
  eventBus
}) => {
  const { map } = mapProvider
  const { datasets } = pluginConfig

  const getDatasets = () => pluginStateRef.current.datasets || datasets

  // Initialize all datasets once
  datasets.forEach(dataset => {
    addMapLayers(map, mapStyleId, dataset)
  })

  // Handle style changes
  const styleHandler = handleSetMapStyle({
    map,
    events,
    eventBus,
    getDatasets
  })

  return {
    remove() {
      eventBus.off(events.MAP_SET_STYLE, styleHandler)

      // Clean up sources and layers
      getDatasets().forEach(dataset => {
        const sourceId = `${dataset.id}-source`
        const fillLayerId = dataset.fill ? dataset.id : null
        const strokeLayerId = dataset.stroke ? (dataset.fill ? `${dataset.id}-stroke` : dataset.id) : null

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
