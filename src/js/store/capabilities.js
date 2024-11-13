export const capabilities = {
    default: {
        hasSize: true,
        isSupported: () => {
            try {
                return eval(`typeof Object.getPrototypeOf(async function() {}).constructor === 'function'`)
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