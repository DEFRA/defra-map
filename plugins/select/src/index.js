// src/plugins/select/index.js
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
