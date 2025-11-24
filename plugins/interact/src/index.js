// /plugins/interact/index.js
import './interact.scss'

export default function createPlugin (options = {}) {
  return {
    ...options,
    id: 'interact',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-interact-plugin" */ './manifest.js')).manifest
      return module
    }
  }
}
