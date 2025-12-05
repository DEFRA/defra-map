import { debounce } from './utils/debounce.js'
import { fetchData } from './effects/fetchData.js'
import { handleSetMapStyle } from './effects/handleSetMapStyle.js'

export const createDataLayers = ({
  layersConfig,
  mapStyleId,
  mapProvider,
  eventBus
}) => {
  const { map } = mapProvider
  const sourceCache = new Map()
  const dataCache = new Map()
  const { transformRequest, layers } = layersConfig

  const debouncedFetch = debounce(() =>
    fetchData({
      map,
      mapStyleId,
      layers,
      transformRequest,
      dataCache,
      sourceCache
    }), 300)

  map.on('moveend', debouncedFetch)

  const styleHandler = handleSetMapStyle({
    map,
    eventBus,
    layers,
    transformRequest,
    dataCache,
    sourceCache
  })

  return {
    remove() {
      debouncedFetch.cancel() // Doesn't work here??
      map.off('moveend', debouncedFetch)
      eventBus.off('map:setmapstyle', styleHandler)
    }
  }
}
