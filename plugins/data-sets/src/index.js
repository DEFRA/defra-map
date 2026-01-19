// /plugins/data-sets/index.js
import './dataSets.scss'

export default function createPlugin (options = {}) {
  const plugin = {
    ...options,
    id: 'dataSets',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-data-sets-plugin" */ './manifest.js')).manifest
      return module
    }
  }

  return plugin
}
