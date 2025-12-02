// --- MOCK SETUP: Global Event Dispatcher ---

const eventListeners = {}
const mediaListeners = {}
let mockedMediaQuery

const mockMatchMedia = (query) => {
  const mediaQuery = {
    matches: false,
    media: query,
    // Mock addEventListener for 'change' events
    addEventListener: jest.fn((event, fn) => {
      if (event === 'change') {
        if (!mediaListeners[query]) mediaListeners[query] = []
        mediaListeners[query].push(fn)
      }
    }),
    // Mock removeEventListener for cleanup coverage
    removeEventListener: jest.fn((event, fn) => {
      if (event === 'change' && mediaListeners[query]) {
        mediaListeners[query] = mediaListeners[query].filter(l => l !== fn)
      }
    })
  }
  mockedMediaQuery = mediaQuery
  return mediaQuery
}

// Mock for window.addEventListener/removeEventListener
const mockAddEventListener = jest.fn((event, handler) => {
  if (!eventListeners[event]) eventListeners[event] = []
  eventListeners[event].push(handler)
})
const mockRemoveEventListener = jest.fn((event, handler) => {
  if (eventListeners[event]) {
    eventListeners[event] = eventListeners[event].filter(h => h !== handler)
  }
})

// Replace global methods with mocks
Object.defineProperty(window, 'matchMedia', { writable: true, value: jest.fn(mockMatchMedia) })
Object.defineProperty(window, 'addEventListener', { writable: true, value: mockAddEventListener })
Object.defineProperty(window, 'removeEventListener', { writable: true, value: mockRemoveEventListener })

// --- EVENT TRIGGER HELPERS ---

const triggerMediaChange = (matches) => {
  if (mockedMediaQuery) {
    mockedMediaQuery.matches = matches
  }
  const queryListeners = mediaListeners['(pointer: coarse)']
  if (queryListeners) {
    queryListeners.forEach(fn => fn({ matches }))
  }
}

const triggerDomEvent = (event, payload) => {
  const handlers = eventListeners[event]
  if (handlers) {
    handlers.forEach(handler => handler(payload))
  }
}

// --- TEST SUITE ---
describe('Interface Detector Utility Module', () => {
  let createInterfaceDetector, getInterfaceType, subscribeToInterfaceChanges
  let cleanup

  // Uses async/await and jest.resetModules() for test isolation (critical for global state)
  beforeEach(async () => {
    jest.resetModules()

    // Default initial mock state: not 'touch' (coarse=false)
    window.matchMedia.mockImplementationOnce((query) => {
      const mock = mockMatchMedia(query)
      mock.matches = false
      return mock
    })

    const importedModule = await import('./detectInterfaceType.js')

    createInterfaceDetector = importedModule.createInterfaceDetector
    getInterfaceType = importedModule.getInterfaceType
    subscribeToInterfaceChanges = importedModule.subscribeToInterfaceChanges

    // Reset mock state
    Object.keys(eventListeners).forEach(key => delete eventListeners[key])
    Object.keys(mediaListeners).forEach(key => delete mediaListeners[key])
    window.matchMedia.mockClear()
    window.addEventListener.mockClear()
    window.removeEventListener.mockClear()
  })

  // Test 1: Covers initial state (coarse=false -> 'unknown' -> getInterfaceType fallback 'mouse')
  it('should initialize to "mouse" and fall back correctly if type is unknown', () => {
    expect(getInterfaceType()).toBe('mouse')

    cleanup = createInterfaceDetector()

    expect(getInterfaceType()).toBe('mouse')
  })

  // Test 2: Comprehensive test of all event paths, listener notification, and cleanup
  it('should handle all three event types, notify listeners only on change, and run cleanup', () => {
    const handler = jest.fn()

    // --- Setup and Initial State ---
    const unsubscribe = subscribeToInterfaceChanges(handler)
    cleanup = createInterfaceDetector()
    handler.mockClear()

    // --- Path 1: pointerdown (Covers normalizePointerType branches: touch, pen, mouse, unknown) ---
    // 1a: 'touch' (Sets state to 'touch', notifies)
    triggerDomEvent('pointerdown', { pointerType: 'touch' })
    expect(getInterfaceType()).toBe('touch')
    expect(handler).toHaveBeenCalledWith('touch')
    handler.mockClear()

    // 1b: 'pen' (State remains 'touch', no notification)
    triggerDomEvent('pointerdown', { pointerType: 'pen' })
    expect(handler).not.toHaveBeenCalled()

    // 1c: 'mouse' (Sets state to 'mouse', notifies)
    triggerDomEvent('pointerdown', { pointerType: 'mouse' })
    expect(getInterfaceType()).toBe('mouse')
    expect(handler).toHaveBeenCalledWith('mouse')
    handler.mockClear()

    // 1d: 'weird' (Sets state to 'unknown', notifies)
    triggerDomEvent('pointerdown', { pointerType: 'weird' })
    expect(getInterfaceType()).toBe('mouse') // Returns 'mouse' due to fallback
    expect(handler).toHaveBeenCalledWith('unknown')
    handler.mockClear()

    // --- Path 2: keydown (Covers keydown event listener) ---
    triggerDomEvent('keydown', { key: 'Tab' })
    expect(getInterfaceType()).toBe('keyboard')
    expect(handler).toHaveBeenCalledWith('keyboard')
    handler.mockClear()

    // keydown with non-Tab (No change, no notification)
    triggerDomEvent('keydown', { key: 'a' })
    expect(handler).not.toHaveBeenCalled()

    // --- Path 3: matchMedia Change (Covers handleMediaChange logic) ---
    // Simulate media change to coarse (touch)
    triggerMediaChange(true)
    expect(getInterfaceType()).toBe('touch')
    expect(handler).toHaveBeenCalledWith('touch')
    handler.mockClear()

    // Simulate media change back to fine (mouse)
    triggerMediaChange(false)
    expect(getInterfaceType()).toBe('mouse')
    expect(handler).toHaveBeenCalledWith('mouse')
    handler.mockClear()

    // --- Cleanup and Verification ---
    cleanup() // Call cleanup (Covers all removeEventListener calls)
    unsubscribe() // Covers listeners.delete()

    // Verify events no longer fire after cleanup
    triggerDomEvent('keydown', { key: 'Tab' })
    expect(handler).not.toHaveBeenCalled()
  })

  // Test 3: Covers initial state (coarse=true -> 'touch')
  it('should return "touch" when matchMedia initially matches coarse pointer', async () => {
    jest.resetModules()

    // Re-mock matchMedia to match coarse pointer *before* the re-import
    window.matchMedia.mockImplementationOnce((query) => {
      const mock = mockMatchMedia(query)
      mock.matches = true
      return mock
    })

    const importedModule = await import('./detectInterfaceType.js')
    getInterfaceType = importedModule.getInterfaceType

    // lastInterfaceType is 'touch' initially in this scenario
    expect(getInterfaceType()).toBe('touch')
  })
})
