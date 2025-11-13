import { mergeManifests } from './mergeManifests'

describe('mergeManifests', () => {
  test('should return empty object when called with no arguments', () => {
    const result = mergeManifests()
    expect(result).toEqual({})
  })

  test('should merge top-level properties', () => {
    const base = { name: 'Base' }
    const override = { version: 2 }
    const result = mergeManifests(base, override)
    expect(result).toEqual({ name: 'Base', version: 2 })
  })

  test('should merge buttons by id', () => {
    const base = { buttons: [{ id: 'b1', label: 'Base' }] }
    const override = { buttons: [{ id: 'b1', label: 'Override' }, { id: 'b2', label: 'New' }] }
    const result = mergeManifests(base, override)
    expect(result.buttons).toEqual([
      { id: 'b1', label: 'Override' },
      { id: 'b2', label: 'New' }
    ])
  })

  test('should handle undefined override parameter', () => {
    const base = { buttons: [{ id: 'b1', label: 'Base' }] }
    const result = mergeManifests(base, undefined)
    expect(result.buttons).toEqual([{ id: 'b1', label: 'Base' }])
  })

  test('should handle undefined base parameter', () => {
    const override = { buttons: [{ id: 'b1', label: 'Override' }] }
    const result = mergeManifests(undefined, override)
    expect(result.buttons).toEqual([{ id: 'b1', label: 'Override' }])
  })

  test('mergeById converts non-array baseArr and overrideArr to empty arrays', () => {
    const base = { buttons: {} } // non-array, truthy → triggers baseArr branch
    const override = { buttons: null } // non-array → triggers overrideArr branch
    const result = mergeManifests(base, override)
    expect(result.buttons).toEqual([]) // both converted to empty arrays
  })

  test('should handle panels, controls, and icons similarly', () => {
    const base = {
      panels: [{ id: 'p1', title: 'Base Panel' }],
      controls: [{ id: 'c1', type: 'Base Control' }],
      icons: [{ id: 'i1', name: 'Base Icon' }]
    }
    const override = {
      panels: [{ id: 'p1', title: 'Override Panel' }, { id: 'p2', title: 'New Panel' }],
      controls: [{ id: 'c1', type: 'Override Control' }, { id: 'c2', type: 'New Control' }],
      icons: [{ id: 'i1', name: 'Override Icon' }, { id: 'i2', name: 'New Icon' }]
    }
    const result = mergeManifests(base, override)
    expect(result.panels).toEqual([
      { id: 'p1', title: 'Override Panel' },
      { id: 'p2', title: 'New Panel' }
    ])
    expect(result.controls).toEqual([
      { id: 'c1', type: 'Override Control' },
      { id: 'c2', type: 'New Control' }
    ])
    expect(result.icons).toEqual([
      { id: 'i1', name: 'Override Icon' },
      { id: 'i2', name: 'New Icon' }
    ])
  })

  test('should handle non-array inputs gracefully', () => {
    const base = { buttons: {}, panels: {}, controls: {}, icons: {} }
    const override = { buttons: [], panels: [], controls: [], icons: [] }
    const result = mergeManifests(base, override)
    expect(result.buttons).toEqual([])
    expect(result.panels).toEqual([])
    expect(result.controls).toEqual([])
    expect(result.icons).toEqual([])
  })

  test('should ignore items without ids', () => {
    const base = { buttons: [{ id: 'b1', label: 'Base' }] }
    const override = { buttons: [{ label: 'No ID' }, null, undefined] }
    const result = mergeManifests(base, override)
    expect(result.buttons).toEqual([{ id: 'b1', label: 'Base' }])
  })
})
