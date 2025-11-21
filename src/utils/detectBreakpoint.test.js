// --- MOCK SETUP for window.matchMedia ---
const mediaListeners = {}
let mockedQueries = {} 

const mockMatchMedia = (query) => {
  const mediaQuery = {
    matches: false, 
    media: query,
    // Note: addEventListener/removeEventListener calls are necessary for cleanup coverage.
    addEventListener: jest.fn((event, fn) => {
      if (event === 'change') {
        if (!mediaListeners[query]) mediaListeners[query] = []
        mediaListeners[query].push(fn)
      }
    }),
    removeEventListener: jest.fn((event, fn) => {
      if (event === 'change' && mediaListeners[query]) {
        mediaListeners[query] = mediaListeners[query].filter(l => l !== fn)
      }
    }),
  }
  mockedQueries[query] = mediaQuery 
  return mediaQuery
}

// Replace the global window.matchMedia with our mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn(mockMatchMedia),
})

const triggerMediaQueryChange = (query, matches) => {
  const queryListeners = mediaListeners[query]
  const queryObject = mockedQueries[query] 

  if (queryObject) {
    // Crucial: Update the .matches property BEFORE running the listener
    queryObject.matches = matches 
  }

  if (queryListeners) {
    queryListeners.forEach(fn => fn({ matches, media: query }))
  }
}

// --- TEST SUITE ---
describe('Breakpoint Detection Utility Module', () => {
  let createBreakpointDetector, subscribeToBreakpointChange, getBreakpoint
  const BREAKPOINTS = {
    MOBILE_QUERY: '(max-width: 768px)',
    DESKTOP_QUERY: '(min-width: 1024px)',
    CONFIG: { maxMobileWidth: 768, minDesktopWidth: 1024 }
  }

  // NOTE: Switched to async/await for dynamic import
  beforeEach(async () => {
    // 1. Resetting module-level state is essential for isolation
    jest.resetModules()
    
    // Switched from require() to dynamic import() to load the module
    const importedModule = await import('./detectBreakpoint') 
    
    // Assign imported functions
    createBreakpointDetector = importedModule.createBreakpointDetector
    subscribeToBreakpointChange = importedModule.subscribeToBreakpointChange
    getBreakpoint = importedModule.getBreakpoint
    
    // Clear global mock and query state
    Object.keys(mediaListeners).forEach(key => delete mediaListeners[key])
    mockedQueries = {} 
    window.matchMedia.mockClear()
  })

  // Covers initial 'unknown' check inside getBreakpoint
  it('should return "desktop" initially before detection runs', () => {
    expect(getBreakpoint()).toBe('desktop')
  })

  // Covers all initial detection states (Mobile, Desktop, Tablet)
  it.each([
    ['mobile', true, false, 'mobile'],
    ['desktop', false, true, 'desktop'],
    ['tablet (fallback)', false, false, 'tablet'], 
  ])('should detect %s on initial run', (name, mobileMatch, desktopMatch, expected) => {
    // Arrange: Configure matchMedia mock for the specific test case
    window.matchMedia.mockImplementation((query) => {
      const mock = mockMatchMedia(query)
      if (query === BREAKPOINTS.MOBILE_QUERY) {
        mock.matches = mobileMatch
      } else if (query === BREAKPOINTS.DESKTOP_QUERY) {
        mock.matches = desktopMatch
      }
      return mock
    })

    createBreakpointDetector(BREAKPOINTS.CONFIG)
    expect(getBreakpoint()).toBe(expected)
  })

  it('should handle all subscription, dynamic change, no-change, and cleanup scenarios', () => {
    const fn1 = jest.fn()
    const fn2 = jest.fn()
    
    // --- Subscription and Initial State (Covers listeners.add(fn)) ---
    const unsubscribe1 = subscribeToBreakpointChange(fn1)
    subscribeToBreakpointChange(fn2)
    
    // Unsubscribe fn1 immediately (Covers listeners.delete(fn))
    unsubscribe1() 
    
    const cleanup = createBreakpointDetector(BREAKPOINTS.CONFIG) 
    expect(getBreakpoint()).toBe('tablet') 

    const mobileQueryMock = mockedQueries[BREAKPOINTS.MOBILE_QUERY]
    const desktopQueryMock = mockedQueries[BREAKPOINTS.DESKTOP_QUERY]

    // --- Dynamic Transitions ---
    // 1. Mobile
    triggerMediaQueryChange(BREAKPOINTS.MOBILE_QUERY, true)
    expect(getBreakpoint()).toBe('mobile')
    expect(fn1).not.toHaveBeenCalled() // fn1 unsubscribed
    expect(fn2).toHaveBeenCalledWith('mobile') 
    fn2.mockClear()

    // 2. No change (Covers `if (type !== lastBreakpoint)` being false)
    triggerMediaQueryChange(BREAKPOINTS.MOBILE_QUERY, true)
    expect(fn2).not.toHaveBeenCalled() 
    
    // 3. Desktop
    triggerMediaQueryChange(BREAKPOINTS.MOBILE_QUERY, false) 
    triggerMediaQueryChange(BREAKPOINTS.DESKTOP_QUERY, true) 
    expect(getBreakpoint()).toBe('desktop')
    expect(fn2).toHaveBeenCalledWith('desktop')
    fn2.mockClear()

    // --- Cleanup and Isolation ---
    // 4. Call detector cleanup (Covers mobileQuery.removeEventListener/desktopQuery.removeEventListener)
    cleanup()

    // Check that the mock's removeEventListener was called (for coverage verification)
    expect(mobileQueryMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(desktopQueryMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    // 5. Test that nothing is called after full cleanup
    triggerMediaQueryChange(BREAKPOINTS.MOBILE_QUERY, true)
    expect(fn2).not.toHaveBeenCalled() 
  })
})