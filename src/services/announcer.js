// services/announcer.js
import { debounce } from '../utils/debounce.js'

export function createAnnouncer(mapStatusRef) {
  const CLEAR_DELAY = 100
  const DEBOUNCE_DELAY = 500
  let priorityLock = false

  // Core function to write to the live region
  const setLiveRegion = (msg) => {
    if (!mapStatusRef?.current || !msg) {
      return
    }

    // Clear first (for SR to re-announce)
    mapStatusRef.current.textContent = ''
    setTimeout(() => {
      mapStatusRef.current.textContent = msg
    }, CLEAR_DELAY)
  }

  // Debounced announcer to group rapid events
  const debouncedAnnounce = debounce(setLiveRegion, DEBOUNCE_DELAY)

  // Public announce function
  const announce = (msg, type = 'core') => {
    if (!msg) {
      return
    }

    if (type === 'plugin') {
      priorityLock = true
      setLiveRegion(msg)
      return
    }

    if (priorityLock) {
      // skip this one but release lock for next time
      priorityLock = false
      return
    }

    debouncedAnnounce(msg)
  }

  return announce
}
