export const capabilities = {
  default: {
    hasSize: !!window.globalThis,
    isLatest: !!window.globalThis,
    isSupported: () => {
      try {
        return eval('typeof Object.getPrototypeOf(async function() {}).constructor === \'function\'')
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
