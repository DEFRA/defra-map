import { handleSetMapStyle } from './handleSetMapStyle.js'
import { addMapLayers } from './mapLayers.js'

export const createDataSets = ({
  pluginConfig,
  pluginStateRef,
  mapStyleId,
  mapProvider,
  events,
  eventBus
}) => {
  const { map } = mapProvider
  const { dataSets } = pluginConfig

  const getDataSets = () => pluginStateRef.current.dataSets || dataSets

  // Initialize all dataSets once
  dataSets.forEach(dataSet => {
    addMapLayers(map, mapStyleId, dataSet)
  })

  // Handle style changes
  const styleHandler = handleSetMapStyle({
    map,
    events,
    eventBus,
    getDataSets
  })

  return {
    remove() {
      eventBus.off(events.MAP_SET_STYLE, styleHandler)

      // Clean up sources and layers
      getDataSets().forEach(dataSet => {
        const sourceId = `${dataSet.id}-source`
        const fillLayerId = dataSet.fill ? dataSet.id : null
        const strokeLayerId = dataSet.stroke ? (dataSet.fill ? `${dataSet.id}-stroke` : dataSet.id) : null

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
