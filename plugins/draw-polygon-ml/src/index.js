// src/plugins/drawPolygonML/index.js
import './drawPolygon.scss'

export default function createPlugin (options = {}) {
  return {
    ...options,
    id: 'drawPolygon',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-draw-polygon-ml-plugin" */ './manifest.js')).manifest
      return module
    },
    api: {}
  }
}
