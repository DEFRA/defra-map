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

// Internal map provider descriptors
const internalMapProviders = {
  maplibre: {
    capabilities: {
      isLatest: !!window.globalThis,
      hasDraw: true,
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
      const module = await import(/* webpackChunkName: "flood-map-maplibre-provider" */ './maplibre/provider.js')
      return module.default
    }
  },

  esri: {
    capabilities: {
      hasDraw: true,
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
      const module = await import(/* webpackChunkName: "flood-map-esri-provider" */ './esri/provider.js')
      return module.default
    }
  }
}

// External (user-registered) map providers
const externalProviders = {}

// Internal geocode provider descriptors
const internalGeocodeProviders = {
  'os-open-names': {
    load: async () => {
      const module = await import(/* webpackChunkName: "flood-map-geocode-provider" */ './os-open-names/geocode.js')
      return module.default
    }
  }
}

// External (user-registered) geocode providers
const externalGeocodeProviders = {}

// Internal reverse geocode provider descriptors
const internalReverseGeocodeProviders = {
  'os-open-names': {
    load: async () => {
      const module = await import(/* webpackChunkName: "flood-map-reverse-geocode-provider" */ './os-open-names/reverse-geocode.js')
      return module.default
    }
  }
}

// External (user-registered) reverse geocode providers
const externalReverseGeocodeProviders = {}

// Get a map provider by ID
export function getMapProvider (id) {
  return externalProviders[id] || internalMapProviders[id || 'maplibre']
}

// Get a geocode provider by ID
export function getGeocodeProvider (id) {
  return externalGeocodeProviders[id] || internalGeocodeProviders[id || 'os-open-names']
}

// Get a reverse geocode provider by ID
export function getReverseGeocodeProvider (id) {
  return externalReverseGeocodeProviders[id] || internalReverseGeocodeProviders[id || 'os-open-names']
}

// Register an external provider
export function registerMapProvider (descriptor) {
  if (!descriptor?.id || typeof descriptor.init !== 'function') {
    throw new Error('Invalid provider descriptor')
  }
  externalProviders[descriptor.id] = descriptor
}
