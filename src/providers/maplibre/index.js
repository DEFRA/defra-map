import { getWebGL } from './utils/detectWebgl.js'

const isLatest = !!window.globalThis

// MapLibre provider descriptor
export default {
  crs: 'ESPG:4326',
  checkDeviceCapabilities: () => {
    const webGL = getWebGL(['webgl2', 'webgl1'])
    const isIE = document.documentMode
    return {
      isSupported: webGL.isEnabled,
      error: (isIE && 'Internet Explorer is not supported') || webGL.error
    }
  },
  load: async () => {
    let mapFramework
    if (isLatest) {
      const maplibre = await import(/* webpackChunkName: "am-maplibre-framework" */ 'maplibre-gl')
      mapFramework = maplibre
    } else {
      const [maplibreLegacy, resizeObserver] = await Promise.all([
        import(/* webpackChunkName: "am-maplibre-legacy-framework" */ 'maplibre-gl-legacy'),
        import(/* webpackChunkName: "am-maplibre-legacy-framework" */ 'resize-observer'),
        import(/* webpackChunkName: "am-maplibre-legacy-framework" */ 'core-js/es/array/flat.js')
      ])
      if (!window.ResizeObserver) {
        resizeObserver.install()
      }
      mapFramework = maplibreLegacy
    }

    const MapProvider = (await import(/* webpackChunkName: "am-maplibre-provider" */ './maplibreProvider.js')).default

    return [
      MapProvider,
      mapFramework
    ]
  }
}
