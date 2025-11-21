/**
 * @jest-environment jsdom
 */

import { getIsFullscreen } from './getIsFullscreen.js'

describe('getIsFullscreen', () => {
  // Use it.each to test all logical branches and combinations concisely.
  it.each([
    // --- True Cases (Covers all branches resulting in true) ---
    // Branch 1: ['mapOnly', 'buttonFirst'].includes(behaviour)
    ['mapOnly', 'desktop', true],
    ['buttonFirst', 'desktop', true],
    ['mapOnly', 'mobile', true], // Should still be true regardless of breakpoint

    // Branch 2: breakpoint === 'mobile' && behaviour === 'hybrid'
    ['hybrid', 'mobile', true], 

    // --- False Cases (Covers all combinations resulting in false) ---
    // If behaviour is not in the list, and the mobile/hybrid condition is not met.
    ['hybrid', 'desktop', false], // Not mobile AND not in list
    ['hybrid', 'tablet', false], // Not mobile AND not in list
    ['someOtherValue', 'mobile', false], // Mobile is true, but behaviour is not 'hybrid'
    ['someOtherValue', 'desktop', false], // Neither condition met

  ])('should return %s for behaviour: %s and breakpoint: %s', (behaviour, breakpoint, expected) => {
    const result = getIsFullscreen(behaviour, breakpoint)
    expect(result).toBe(expected)
  })
})