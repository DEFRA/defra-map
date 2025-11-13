// src/plugins/search/index.js
export default function createPlugin (options = {}) {
  return {
    showMarker: true,
    ...options,
    id: 'search',
    load: async () => {
      const module = (await import(/* webpackChunkName: "am-search-plugin" */ './manifest.js')).manifest
      return module
    }
  }
}
