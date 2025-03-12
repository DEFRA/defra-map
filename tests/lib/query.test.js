import { parseSegments, parseLayers, parseGroups } from '../../src/js/lib/query'

describe('query.js', () => {
  let originalLocation

  beforeEach(() => {
    originalLocation = window.location
    delete window.location
    window.location = { search: '' }
  })

  afterEach(() => {
    window.location = originalLocation
  })

  describe('parseSegments', () => {
    it('should return null if dataSegments is null', () => {
      expect(parseSegments(null)).toBeNull()
    })

    it('should parse segments correctly with explicit seg parameter', () => {
      const dataSegments = [
        { parentIds: [], items: [{ id: '1' }, { id: '2', isSelected: true }] },
        { parentIds: ['1'], items: [{ id: '3' }, { id: '4' }] }
      ]
      const seg = ['3']
      const result = parseSegments(dataSegments, seg)
      expect(result).toEqual(['2'])
    })

    it('should parse segments from URL when seg not provided', () => {
      window.location.search = '?seg=3,4'
      const dataSegments = [
        { parentIds: [], items: [{ id: '1' }, { id: '2', isSelected: true }] },
        { parentIds: ['1'], items: [{ id: '3' }, { id: '4' }] }
      ]
      const result = parseSegments(dataSegments)
      expect(result).toEqual(['2'])
    })

    it('should handle segments with no parent correctly', () => {
      const dataSegments = [
        { parentIds: [], items: [{ id: '1' }, { id: '2', isSelected: true }] },
        { parentIds: [], items: [{ id: '3' }, { id: '4', isSelected: true }] }
      ]
      const result = parseSegments(dataSegments)
      expect(result).toEqual(['2', '4'])
    })

    it('should skip segments with inactive parents', () => {
      const dataSegments = [
        { parentIds: [], items: [{ id: '1' }] },
        { parentIds: ['999'], items: [{ id: '3' }, { id: '4', isSelected: true }] }
      ]
      const result = parseSegments(dataSegments)
      expect(result).toEqual(['1'])
    })

    it('should use first item if no selected item found', () => {
      const dataSegments = [
        { parentIds: [], items: [{ id: '1' }, { id: '2' }] }
      ]
      const result = parseSegments(dataSegments)
      expect(result).toEqual(['1'])
    })

    it('should handle empty items array', () => {
      const dataSegments = [
        { parentIds: [], items: [] }
      ]
      const result = parseSegments(dataSegments)
      expect(result).toEqual([undefined])
    })
  })

  describe('parseLayers', () => {
    it('should return null if dataLayers is null', () => {
      expect(parseLayers(null)).toBeNull()
    })

    it('should parse layers correctly when using default selection', () => {
      const dataLayers = [
        { items: [{ id: '1', isSelected: true }, { id: '2' }] },
        { items: [{ id: '3' }, { id: '4', isSelected: true }] }
      ]
      const result = parseLayers(dataLayers)
      expect(result).toEqual(['1', '4'])
    })

    it('should parse layers from URL when lyr parameter is present', () => {
      window.location.search = '?lyr=2,3'
      const dataLayers = [
        { items: [{ id: '1', isSelected: true }, { id: '2' }] },
        { items: [{ id: '3' }, { id: '4', isSelected: true }] }
      ]
      const result = parseLayers(dataLayers)
      expect(result).toEqual(['2', '3'])
    })

    it('should handle layers with no selected items correctly', () => {
      const dataLayers = [
        { items: [{ id: '1' }, { id: '2' }] },
        { items: [{ id: '3' }, { id: '4' }] }
      ]
      const result = parseLayers(dataLayers)
      expect(result).toEqual([])
    })

    it('should remove duplicate layer ids', () => {
      window.location.search = '?lyr=1,1,2'
      const dataLayers = [
        { items: [{ id: '1' }, { id: '2' }] },
        { items: [{ id: '1' }, { id: '3' }] }
      ]
      const result = parseLayers(dataLayers)
      expect(result).toEqual(['1', '2'])
    })

    it('should ignore items without ids', () => {
      const dataLayers = [
        { items: [{ isSelected: true }, { id: '2', isSelected: true }] }
      ]
      const result = parseLayers(dataLayers)
      expect(result).toEqual(['2'])
    })
  })

  describe('parseGroups', () => {
    const data = [
      {
        parentIds: null,
        minZoom: 0,
        maxZoom: 10,
        items: [
          { id: '1', fill: true },
          { id: '2', icon: true, isSelected: true },
          { id: '3', display: 'ramp' }
        ]
      },
      {
        parentIds: ['1'],
        minZoom: 5,
        maxZoom: 15,
        items: [
          { id: '4', items: [{ id: '5', fill: true }] },
          { id: '6', isSelected: true, icon: true }
        ]
      },
      {
        type: 'radio',
        parentIds: ['1'],
        items: [
          { id: '7', fill: true },
          { id: '8', fill: true }
        ]
      },
      {
        parentIds: ['999'],
        items: [{ id: '9', fill: true }]
      },
      {
        minZoom: 20,
        items: [{ id: '10', fill: true }]
      },
      {
        maxZoom: 5,
        items: [{ id: '11', fill: true }]
      }
    ]

    it('should filter groups based on parent IDs', () => {
      const segments = ['1']
      const layers = ['2', '6', '8']
      const zoom = 7
      const result = parseGroups(data, segments, layers, zoom, true, null)
      expect(result).toHaveLength(3)
    })

    it('should filter groups based on zoom level', () => {
      const segments = ['1']
      const layers = ['2', '6']
      const zoom = 7
      const result = parseGroups(data, segments, layers, zoom, true, null)
      expect(result.map(g => g.items[0]?.id)).not.toContain('10')
      expect(result.map(g => g.items[0]?.id)).not.toContain('11')
    })

    it('should flatten groups and items correctly with hasInputs=false', () => {
      const segments = ['1']
      const layers = ['2', '6', '8']
      const zoom = 7
      const result = parseGroups(data, segments, layers, zoom, false, null)
      expect(result).toHaveLength(1)
      expect(result[0].items).toContainEqual(expect.objectContaining({ id: '2' }))
      expect(result[0].items).toContainEqual(expect.objectContaining({ id: '6' }))
      expect(result[0].items).toContainEqual(expect.objectContaining({ id: '8' }))
    })

    it('should handle radio type groups correctly', () => {
      const segments = ['1']
      const layers = ['8']
      const zoom = 7
      const result = parseGroups(data, segments, layers, zoom, false, null)
      expect(result[0].items.some(item => item.id === '8')).toBe(true)
      expect(result[0].items.some(item => item.id === '7')).toBe(false)
    })

    it('should include nested items when parent is checked', () => {
      const segments = ['1']
      const layers = ['4']
      const zoom = 7
      const result = parseGroups(data, segments, layers, zoom, false, null)
      expect(result[0].items.some(item => item.id === '5')).toBe(true)
    })

    it('should add query polygon if queryLabel is provided', () => {
      const segments = ['1']
      const layers = ['2']
      const zoom = 7
      const queryLabel = 'Test Query Polygon'
      const result = parseGroups(data, segments, layers, zoom, false, queryLabel)
      expect(result[0].items).toContainEqual({
        display: 'query-polygon',
        label: queryLabel
      })
    })

    it('should not include items without fill or icon property', () => {
      const testData = [
        {
          parentIds: null,
          items: [
            { id: '1' },
            { id: '2', fill: true, isSelected: true }
          ]
        }
      ]
      const result = parseGroups(testData, [], ['2'], 10, false, null)
      expect(result[0].items).toHaveLength(1)
      expect(result[0].items[0].id).toBe('2')
    })

    it('should not include any groups if all are filtered out', () => {
      const segments = ['999']
      const layers = []
      const zoom = 7
      const testDataNoMatches = [
        {
          parentIds: ['does-not-exist'],
          items: [{ id: '1', fill: true }]
        },
        {
          minZoom: 10,
          maxZoom: 12,
          items: [{ id: '2', fill: true }]
        }
      ]
      const result = parseGroups(testDataNoMatches, segments, layers, zoom, true, null)
      expect(result).toEqual([])
    })

    it('should include items without ids regardless of checked status', () => {
      const testData = [
        {
          parentIds: null,
          items: [
            { label: 'No ID item', fill: true },
            { id: '2', fill: true }
          ]
        }
      ]
      const result = parseGroups(testData, [], ['2'], 10, false, null)
      expect(result[0].items).toHaveLength(2)
      expect(result[0].items).toContainEqual(expect.objectContaining({ label: 'No ID item' }))
    })
  })
})
