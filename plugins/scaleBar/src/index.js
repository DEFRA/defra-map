// src/plugins/scaleBar/index.js
export default function createPlugin ({ manifest, units = 'metric' } = {}) {
  return {
    id: 'scaleBar',
    manifest,
    units,
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-scale-bar-plugin" */ './manifest.js')).manifest
      return module
    }
  }
}
