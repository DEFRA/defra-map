// src/plugins/mapStyles/index.js
export default function createPlugin ({ manifest, mapStyles } = {}) {
  return {
    id: 'mapStyles',
    manifest,
    mapStyles,
    load: async () => {
      const module = (await import(/* webpackChunkName: "am-map-styles-plugin" */ './manifest.js')).manifest
      return module
    },
    handlesMapStyle: true,
    api: {}
  }
}
