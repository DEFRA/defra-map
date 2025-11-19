import { getBbox } from '../utils/bbox.js'
import { fetchGeojson } from '../utils/fetchGeojson.js'
import { updateMapSources } from './mapLayers.js'

export const handleSetMapStyle = ({
  map,
  eventBus,
  layers,
  transformRequest,
  dataCache,
  sourceCache
}) => {
  const onSetStyle = (e) => {
    map.once('idle', async () => {
      const newStyleId = e.id
      const zoom = map.getZoom()
      const bbox = getBbox(map)

      for (const layer of layers) {
        if (zoom < layer.minZoom || zoom > layer.maxZoom) continue

        try {
          // Runtime-only layers (highlight)
          if (!layer.url) {
            updateMapSources(map, newStyleId, layer, null, sourceCache)
            continue
          }

          // Re-fetch GeoJSON to rebuild sources with correct colours
          const geojson = await fetchGeojson(layer.url, transformRequest, bbox)
          dataCache.set(layer.url, geojson)

          updateMapSources(map, newStyleId, layer, geojson, sourceCache)
        } catch (err) {
          console.error(`Failed to reload layer ${layer.id} after style change`, err)
        }
      }
    })
  }

  eventBus.on('map:setmapstyle', onSetStyle)
  return onSetStyle // return reference for cleanup
}
