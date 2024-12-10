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

export const getNullishCoalescingOperator = () => {
  try {
    new Function('let a; a ??= true')
    return { isSupported: true }
  } catch (err) {
    return { isSupported: false, error: 'Nullish coalescing operator not supported' }
  }
}

export const capabilities = {
  default: {
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
    hasSize: false,
    getDevice: () => {
      const webGL = getWebGL(['webgl2'])
      const nullishCoalescingOperator = getNullishCoalescingOperator()
      return {
        isSupported: webGL.isEnabled && nullishCoalescingOperator.isSupported,
        error: webGL.error || nullishCoalescingOperator.error
      }
    }
  }
}
