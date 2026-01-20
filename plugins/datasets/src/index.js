// /plugins/datasets/index.js
import './datasets.scss'

export default function createPlugin (options = {}) {
  const plugin = {
    ...options,
    id: 'datasets',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-datasets-plugin" */ './manifest.js')).manifest
      return module
    }
  }

  return plugin
}
