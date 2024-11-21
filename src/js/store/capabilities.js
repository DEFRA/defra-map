export const capabilities = {
  default: {
    hasSize: !!window.globalThis,
    isLatest: !!window.globalThis,
    isSupported: () => {
      try {
        return !document.documentMode
      } catch (_) {
        return false
      }
    }
  },
  esri: {
    hasSize: false,
    isSupported: () => {
      return !!Array.prototype.findLast
    }
  }
}
