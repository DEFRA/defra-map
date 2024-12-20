const getWebGL = names => {
  if (!window.WebGLRenderingContext) {
    // WebGL is not supported
    return { isEnabled: false, error: 'WebGL is not supported' }
  }
  const canvas = document.createElement('canvas')
  let context = false
  for (const name of names) {
    try {
      context = canvas.getContext(name)
      if (context && typeof context.getParameter === 'function') {
        // WebGL is enabled
        return { isEnabled: true }
      }
    } catch (e) {
      // WebGL is supported, but disabled
    }
  }
  // WebGL is supported, but disabled
  return { isEnabled: false, error: 'WebGL is supported, but disabled' }
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

export const capabilities = {
  default: {
    srid: '4326',
    hasSize: !!window.globalThis,
    isLatest: !!window.globalThis,
    getDevice: () => {
      const webGL = getWebGL(['webgl2', 'webgl1'])
      const isIE = document.documentMode
      return {
        isSupported: webGL.isEnabled,
        error: (isIE && 'Internet Explorer is not supported') || webGL.error
      }
    }
  },
  esri: {
    srid: '27700',
    hasSize: false,
    getDevice: () => {
      const webGL = getWebGL(['webgl2'])
      const arrayFindLast = getArrayFindLast()
      return {
        isSupported: webGL.isEnabled && arrayFindLast.isSupported,
        error: arrayFindLast.error || webGL.error
      }
    }
  }
}
