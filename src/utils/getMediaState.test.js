// getMediaState.test.js
import { getMediaState } from './getMediaState'

describe('getMediaState', () => {
  let originalMatchMedia

  beforeAll(() => {
    // Save original to restore later
    originalMatchMedia = window.matchMedia
  })

  afterAll(() => {
    window.matchMedia = originalMatchMedia
  })

  function mockMatchMedia(matchesMap) {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: matchesMap[query] || false,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }))
  }

  it('returns dark scheme when prefers-color-scheme: dark is true', () => {
    mockMatchMedia({ '(prefers-color-scheme: dark)': true, '(prefers-reduced-motion: reduce)': false })
    expect(getMediaState()).toEqual({ preferredColorScheme: 'dark', prefersReducedMotion: false })
  })

  it('returns light scheme when prefers-color-scheme: dark is false', () => {
    mockMatchMedia({ '(prefers-color-scheme: dark)': false, '(prefers-reduced-motion: reduce)': false })
    expect(getMediaState()).toEqual({ preferredColorScheme: 'light', prefersReducedMotion: false })
  })

  it('detects prefers-reduced-motion', () => {
    mockMatchMedia({ '(prefers-color-scheme: dark)': false, '(prefers-reduced-motion: reduce)': true })
    expect(getMediaState()).toEqual({ preferredColorScheme: 'light', prefersReducedMotion: true })
  })

  it('handles both dark and reduced motion', () => {
    mockMatchMedia({ '(prefers-color-scheme: dark)': true, '(prefers-reduced-motion: reduce)': true })
    expect(getMediaState()).toEqual({ preferredColorScheme: 'dark', prefersReducedMotion: true })
  })
})
