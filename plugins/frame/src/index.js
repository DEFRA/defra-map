// /plugins/frame/index.js
import './frame.scss'

export default function createPlugin ({ manifest } = {}) {
  return {
    id: 'frame',
    manifest,
    load: async () => {
      const module = (await import(/* webpackChunkName: "dm-frame-plugin" */ './manifest.js')).manifest
      return module
    }
  }
}
