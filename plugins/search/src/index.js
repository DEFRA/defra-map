// /plugins/search/index.js
import './search.scss'

export default function createPlugin (options = {}) {
  return {
    showMarker: true,
    ...options,
    id: 'search',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-search-plugin" */ './manifest.js')).manifest
      return module
    }
  }
}
