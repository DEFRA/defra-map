// src/plugins/dataLayers/index.js
export default function createPlugin (options = {}) {
  const plugin = {
    ...options,
    id: 'dataLayers',
    load: async () => {
      const module = (await import(/* webpackChunkName: "am-data-layers-ml-plugin" */ './manifest.js')).manifest
      return module
    }
  }

  return plugin
}
