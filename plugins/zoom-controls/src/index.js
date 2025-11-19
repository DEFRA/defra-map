// src/plugins/mapStyles/index.js
export default function createPlugin () {
  return {
    id: 'zoomControls',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-zoom-controls-plugin" */ './manifest.js')).manifest
      return module
    },
    api: {}
  }
}
