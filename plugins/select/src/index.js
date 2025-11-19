// src/plugins/select/index.js
import './select.scss'

export default function createPlugin (options = {}) {
  return {
    ...options,
    id: 'select',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-select-plugin" */ './manifest.js')).manifest
      return module
    }
  }
}
