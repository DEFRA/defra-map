// /plugins/draw-es/index.js
export default function createPlugin (options = {}) {
  return {
    ...options,
    id: 'draw',
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-draw-es-plugin" */ './manifest.js')).manifest
      return module
    }
  }
}
