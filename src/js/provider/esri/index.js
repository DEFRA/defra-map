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

const getArrayFindLast = () => {
  if (Array.prototype.findLast) {
    return { isSupported: true }
  }
  return {
    isSupported: false,
    error: 'Array.prototype.findLast() is not supported'
  }
}

// ESRI provider descriptor
export default {
  capabilities: {
    hasInclusiveDraw: false,
    hasSize: false
  },
  checkSupport: () => {
    const webGL = getWebGL(['webgl2'])
    const arrayFindLast = getArrayFindLast()
    return {
      isSupported: webGL.isEnabled && arrayFindLast.isSupported,
      error: arrayFindLast.error || webGL.error
    }
  },
  load: async () => {
    const module = await import(/* webpackChunkName: "flood-map-esri-provider" */ './provider.js')
    return module.default
  }
}
