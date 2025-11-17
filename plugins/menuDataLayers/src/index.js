// src/plugins/menuDataLayers/index.js
export default function createPlugin (options = {}) {
  return {
    ...options,
    id: 'menuDataLayers',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-menu-data-layers-plugin" */ './manifest.js')).manifest
      return module
    },
    api: {}
  }
}
