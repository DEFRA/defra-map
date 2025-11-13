let lastBreakpoint = 'unknown'
const listeners = new Set()

function createBreakpointDetector ({ maxMobileWidth, minDesktopWidth }) {
  const mobileQuery = window.matchMedia(`(max-width: ${maxMobileWidth}px)`)
  const desktopQuery = window.matchMedia(`(min-width: ${minDesktopWidth}px)`)

  function detectAndNotify () {
    let type = 'tablet'

    if (mobileQuery.matches) {
      type = 'mobile'
    } else if (desktopQuery.matches) {
      type = 'desktop'
    }

    if (type !== lastBreakpoint) {
      lastBreakpoint = type
      listeners.forEach(fn => fn(type))
    }
  }

  mobileQuery.addEventListener('change', detectAndNotify)
  desktopQuery.addEventListener('change', detectAndNotify)

  // Initial detection
  detectAndNotify()

  // Return cleanup function
  return () => {
    mobileQuery.removeEventListener('change', detectAndNotify)
    desktopQuery.removeEventListener('change', detectAndNotify)
  }
}

function subscribeToBreakpointChange (fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getBreakpoint () {
  return lastBreakpoint === 'unknown' ? 'desktop' : lastBreakpoint
}

export {
  createBreakpointDetector,
  subscribeToBreakpointChange,
  getBreakpoint
}
