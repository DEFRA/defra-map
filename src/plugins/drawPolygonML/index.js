// src/plugins/drawPolygonML/index.js
export default function createPlugin (options = {}) {
  return {
    ...options,
    id: 'drawPolygon',
    load: async () => {
      const module = (await import(/* webpackChunkName: "am-draw-polygon-ml-plugin" */ './manifest.js')).manifest
      return module
    },
    api: {}
  }
}
