import { getBbox } from '../utils/bbox.js'
import { fetchGeojson } from '../utils/fetchGeojson.js'
import { updateMapSources } from './mapLayers.js'

export const fetchData = async ({
  map,
  mapStyleId,
  layers,
  transformRequest,
  dataCache,
  sourceCache
}) => {
  const zoom = map.getZoom()
  const bbox = getBbox(map)

  for (const layer of layers) {
    if (zoom < layer.minZoom || zoom > layer.maxZoom) {
      continue
    }

    try {
      // --- Runtime-only layers (e.g. highlight) ---
      if (!layer.url) {
        updateMapSources(map, mapStyleId, layer, null, sourceCache)
        continue
      }

      // --- Normal layers: fetch/update GeoJSON ---
      const cacheKey = `${layer.url}|${bbox}`
      let geojson = dataCache.get(cacheKey)

      if (!geojson) {
        geojson = await fetchGeojson(layer.url, transformRequest, bbox)
        dataCache.set(cacheKey, geojson)
      }

      updateMapSources(map, mapStyleId, layer, geojson, sourceCache)
    } catch (err) {
      console.error(`Failed to process layer ${layer.id}`, err)
    }
  }
}
