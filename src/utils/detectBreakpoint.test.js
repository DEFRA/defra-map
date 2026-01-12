// --- MOCKS ---
let rafQueue = []
global.requestAnimationFrame = jest.fn(cb => (rafQueue.push(cb), rafQueue.length))
global.cancelAnimationFrame = jest.fn()
const flushRAF = () => { rafQueue.forEach(cb => cb()); rafQueue = [] }

const mediaListeners = {}
let mockedQueries = {}

class MockResizeObserver {
  constructor(callback) { this.callback = callback }
  observe(el) { MockResizeObserver.instance = this }
  disconnect() { MockResizeObserver.instance = null }
  trigger(width, fallback) { 
    this.callback([fallback ? { contentRect: { width } } : { borderBoxSize: [{ inlineSize: width }], contentRect: { width } }])
  }
}
MockResizeObserver.instance = null
global.ResizeObserver = MockResizeObserver

const mockMatchMedia = (query) => {
  const mq = {
    matches: false,
    media: query,
    addEventListener: jest.fn((e, fn) => e === 'change' && (mediaListeners[query] ||= []).push(fn)),
    removeEventListener: jest.fn((e, fn) => e === 'change' && (mediaListeners[query] = mediaListeners[query]?.filter(l => l !== fn)))
  }
  mockedQueries[query] = mq
  return mq
}

window.matchMedia = jest.fn(mockMatchMedia)

const triggerMQ = (query, matches) => {
  if (mockedQueries[query]) mockedQueries[query].matches = matches
  mediaListeners[query]?.forEach(fn => fn({ matches }))
}

// --- TESTS ---
describe('detectBreakpoint', () => {
  let createBreakpointDetector, subscribeToBreakpointChange, getBreakpoint
  const cfg = { maxMobileWidth: 768, minDesktopWidth: 1024 }

  beforeEach(async () => {
    jest.resetModules()
    Object.keys(mediaListeners).forEach(k => delete mediaListeners[k])
    mockedQueries = {}
    MockResizeObserver.instance = null
    rafQueue = []
    const mod = await import('./detectBreakpoint')
    ;({ createBreakpointDetector, subscribeToBreakpointChange, getBreakpoint } = mod)
  })

  it('returns desktop initially', () => {
    expect(getBreakpoint()).toBe('desktop')
  })

  describe('viewport mode', () => {
    it.each([
      ['mobile', true, false],
      ['desktop', false, true],
      ['tablet', false, false]
    ])('detects %s', (name, mobile, desktop) => {
      window.matchMedia.mockImplementation(q => {
        const mq = mockMatchMedia(q)
        if (q === '(max-width: 768px)') mq.matches = mobile
        if (q === '(min-width: 1024px)') mq.matches = desktop
        return mq
      })
      createBreakpointDetector(cfg)
      flushRAF()
      expect(getBreakpoint()).toBe(name)
    })

    it('handles changes and cleanup', () => {
      const fn = jest.fn()
      const unsubscribe = subscribeToBreakpointChange(fn)
      const cleanup = createBreakpointDetector(cfg)
      flushRAF()
      fn.mockClear()
      
      triggerMQ('(max-width: 768px)', true)
      flushRAF()
      expect(getBreakpoint()).toBe('mobile')
      expect(fn).toHaveBeenCalledTimes(1)
      
      triggerMQ('(max-width: 768px)', true) // no change
      flushRAF()
      expect(fn).toHaveBeenCalledTimes(1)
      
      unsubscribe() // Test unsubscribe function
      triggerMQ('(min-width: 1024px)', true)
      flushRAF()
      expect(fn).toHaveBeenCalledTimes(1) // not called after unsubscribe
      
      cleanup()
    })
  })

  describe('container mode', () => {
    let el
    beforeEach(() => {
      el = document.createElement('div')
      el.getBoundingClientRect = jest.fn(() => ({ width: 800 }))
    })

    it.each([
      [500, 'mobile'],
      [800, 'tablet'],
      [1200, 'desktop']
    ])('detects width %i as %s', (width, expected) => {
      el.getBoundingClientRect.mockReturnValue({ width })
      createBreakpointDetector({ ...cfg, containerEl: el })
      flushRAF()
      expect(getBreakpoint()).toBe(expected)
      expect(el.getAttribute('data-breakpoint')).toBe(expected)
    })

    it('handles resize, fallback, and cleanup', () => {
      const fn = jest.fn()
      subscribeToBreakpointChange(fn)
      const cleanup = createBreakpointDetector({ ...cfg, containerEl: el })
      flushRAF()
      fn.mockClear()
      
      MockResizeObserver.instance.trigger(500)
      flushRAF()
      expect(fn).toHaveBeenCalledTimes(1)
      
      MockResizeObserver.instance.trigger(500, true) // fallback path
      flushRAF()
      expect(getBreakpoint()).toBe('mobile')
      
      cleanup()
      expect(el.style.containerType).toBe('')
    })

    it('cleans up previous detector', () => {
      const el2 = document.createElement('div')
      el2.getBoundingClientRect = jest.fn(() => ({ width: 600 }))
      
      createBreakpointDetector({ ...cfg, containerEl: el })
      flushRAF()
      createBreakpointDetector({ ...cfg, containerEl: el2 })
      flushRAF()
      expect(el.style.containerType).toBe('')
    })
  })

  it('handles cleanup when none exists', () => {
    expect(() => createBreakpointDetector(cfg)()).not.toThrow()
  })
})