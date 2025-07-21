const getWebGL = names => {
  if (!window.WebGLRenderingContext) {
    // WebGL is not supported
    return {
      isEnabled: false, error: 'WebGL is not supported'
    }
  }
  const canvas = document.createElement('canvas')
  let context = false
  for (const name of names) {
    try {
      context = canvas.getContext(name)
      if (context && typeof context.getParameter === 'function') {
        // WebGL is enabled
        return {
          isEnabled: true
        }
      }
    } catch (e) {
      // No action required
    }
  }
  // WebGL is supported, but disabled
  return {
    isEnabled: false, error: 'WebGL is supported, but disabled'
  }
}

// MapLibre provider descriptor
export default {
  capabilities: {
    isLatest: !!window.globalThis,
    hasSize: !!window.globalThis
  },
  checkSupport: () => {
    const webGL = getWebGL(['webgl2', 'webgl1'])
    const isIE = document.documentMode
    return {
      isSupported: webGL.isEnabled,
      error: (isIE && 'Internet Explorer is not supported') || webGL.error
    }
  },
  load: async () => {
    const module = await import(/* webpackChunkName: "flood-map-maplibre-provider" */ './map-provider.js')
    return module.default
  }
}
