import { scalePoints } from './scalePoints'

describe('scalePoints', () => {
  it('scales all numeric values by the given factor and rounds them', () => {
    const input = { top: 10, right: 15, bottom: 20, left: 25 }
    const result = scalePoints(input, 2)
    expect(result).toEqual({ top: 5, right: 8, bottom: 10, left: 13 }) // 25/2 -> 12.5 -> rounded 13
  })

  it('handles non-integer scaling factors correctly', () => {
    const input = { top: 10, right: 15 }
    const result = scalePoints(input, 1.5)
    expect(result).toEqual({ top: 7, right: 10 }) // 10/1.5=6.6667 -> 7, 15/1.5=10
  })

  it('handles empty objects', () => {
    const input = {}
    const result = scalePoints(input, 2)
    expect(result).toEqual({})
  })

  it('handles negative values', () => {
    const input = { top: -10, left: -5 }
    const result = scalePoints(input, 2)
    expect(result).toEqual({ top: -5, left: -2 }) // -5, -2.5 -> rounded -2
  })

  it('handles scaleFactor of 1 (no change other than rounding)', () => {
    const input = { top: 3.7, left: 4.2 }
    const result = scalePoints(input, 1)
    expect(result).toEqual({ top: 4, left: 4 }) // rounding applied
  })
})
