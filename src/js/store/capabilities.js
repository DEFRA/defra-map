const getWebGL = () => {
  const names = ['webgl2', 'webgl1']
  if (window.WebGLRenderingContext) {
    const canvas = document.createElement('canvas')
    let context = false

    for (const name of names) {
      try {
        context = canvas.getContext(name)
        if (context && typeof context.getParameter === 'function') {
          // WebGL is enabled
          return name
        }
      } catch (e) {
        // WebGL is supported, but disabled
      }
    }

    // WebGL is supported, but disabled
    console.log('WebGL is supported, but disabled')
    return
  }

  // WebGL is not supported
  console.log('WebGL is not supported')
}

const isInternetExplorer = () => {
  try {
    if (document.documentMode) {
      console.log('Internet Explorer is not supported')
      return true
    }
  } catch (e) {
    // Not IE
  }
  return false
}

const hasArrayFindLast = () => {
  if (Array.prototype.findLast) {
    return true
  }
  console.log('Array.prototype.findLast() is not supported')
  return false
}

const webGl = getWebGL()

export const capabilities = {
  default: {
    hasSize: !!window.globalThis,
    isLatest: webGl === 'webgl2' && !!window.globalThis,
    isSupported: () => {
      return ['webgl2', 'webgl1'].includes(webGl) && !isInternetExplorer()
    }
  },
  esri: {
    hasSize: false,
    isSupported: () => {
      return webGl === 'webgl2' && hasArrayFindLast()
    }
  }
}
