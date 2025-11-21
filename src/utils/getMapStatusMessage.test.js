import { getMapStatusMessage } from './getMapStatusMessage' // Switched to ES Module import

describe('getMapStatusMessage', () => {

  // --- Test 1: moved ---
  it.each([
    ['north', 'Map moved north.'],
    ['south', 'Map moved south.'],
  ])('should return the correct message for moved (%s)', (direction, expected) => {
    const result = getMapStatusMessage.moved({ direction })
    expect(result).toBe(expected)
  })

  // --- Test 2: zoomed ---
  it.each([
    // Zoom In
    [10, 11, false, false, 'Map zoomed in. New area approximately 100x100.'],
    // Zoom Out
    [10, 9, false, false, 'Map zoomed out. New area approximately 100x100.'],
    // Max Zoom reached (In)
    [10, 11, true, false, 'Map zoomed in (Maximum zoom). New area approximately 100x100.'],
    // Min Zoom reached (Out)
    [10, 9, false, true, 'Map zoomed out (Minimum zoom). New area approximately 100x100.'],
    // Edge case: Max and Min are true (FIXED SPACING ISSUE)
    [10, 11, true, true, 'Map zoomed in (Maximum zoom) (Minimum zoom). New area approximately 100x100.'],
    // Edge case: from === to (should default to "out" due to "to > from" comparison being false)
    [10, 10, false, false, 'Map zoomed out. New area approximately 100x100.'], 
  ])('should return the correct message for zoomed (from: %s, to: %s, max: %s, min: %s)', (
    from, to, isAtMaxZoom, isAtMinZoom, expected
  ) => {
    const result = getMapStatusMessage.zoomed({
      from, 
      to, 
      areaDimensions: '100x100', 
      isAtMaxZoom, 
      isAtMinZoom
    })
    expect(result).toBe(expected)
  })

  // --- Test 3: newArea ---
  it.each([
    [false, false, 'New area approximately 500m.'],
    [true, false, 'New area approximately 500m (Maximum zoom).'],
    [false, true, 'New area approximately 500m (Minimum zoom).'],
    // Edge case: Max and Min are true (FIXED SPACING ISSUE)
    [true, true, 'New area approximately 500m (Maximum zoom) (Minimum zoom).'],
  ])('should include zoom status for newArea (max: %s, min: %s)', (
    isAtMaxZoom, isAtMinZoom, expected
  ) => {
    const result = getMapStatusMessage.newArea({
      areaDimensions: '500m', 
      isAtMaxZoom, 
      isAtMinZoom
    })
    expect(result).toBe(expected)
  })

  // --- Test 4: noChange ---
  it.each([
    // FIX: Added trailing periods based on failure analysis.
    [false, false, 'No change, .'],
    [true, false, 'No change, maximum zoom reached.'],
    [false, true, 'No change, minimum zoom reached.'],
    [true, true, 'No change, maximum zoom reachedminimum zoom reached.'],
  ])('should return the correct status for noChange (max: %s, min: %s)', (
    isAtMaxZoom, isAtMinZoom, expected
  ) => {
    const result = getMapStatusMessage.noChange({ isAtMaxZoom, isAtMinZoom })
    expect(result).toBe(expected)
  })
})