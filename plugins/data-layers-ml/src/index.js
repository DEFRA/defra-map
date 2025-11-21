// /plugins/data-layers-ml/index.js
import './dataLayers.scss'

export default function createPlugin (options = {}) {
  const plugin = {
    ...options,
    id: 'dataLayers',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-data-layers-ml-plugin" */ './manifest.js')).manifest
      return module
    }
  }

  return plugin
}
