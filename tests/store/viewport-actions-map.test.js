import { actionsMap } from '../../src/js/store/viewport-actions-map'
import { getDescription } from '../../src/js/lib/viewport'
import { isSame } from '../../src/js/lib/utils'

jest.mock('../../src/js/lib/viewport', () => ({
  getStatus: jest.fn(),
  getPlace: jest.fn(),
  getDescription: jest.fn()
}))

jest.mock('../../src/js/lib/utils', () => ({
  isSame: jest.fn()
}))

describe('store/viewport-actions-map - update', () => {
  it('should handle INIT action correctly', () => {
    const state = {
      oPlace: 'old-place',
      originalZoom: 10,
      isUserInitiated: true,
      action: 'INIT',
      center: [-2.902397, 54.901112],
      zoom: 10,
      place: 'current-place'
    }

    const payload = {
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.902397, 54.901112],
      zoom: 12,
      features: ['feature1', 'feature2']
    }

    const result = actionsMap.UPDATE(state, payload)

    expect(result).toMatchObject({
      bounds: payload.bounds,
      center: payload.center,
      zoom: payload.zoom,
      features: payload.features,
      isMoving: false,
      action: null
    })

    // Check that original values are copied over for INIT action
    expect(result).toHaveProperty('oBbox', payload.bounds)
    expect(result).toHaveProperty('oCentre', payload.center)
    expect(result).toHaveProperty('rZoom', payload.zoom)
    expect(result).toHaveProperty('originalZoom', state.originalZoom)

    // Check that isUpdate is true when action is INIT
    expect(result.isUpdate).toBeTruthy()
  })

  it('should handle GEOLOC action correctly', () => {
    const state = {
      oPlace: 'old-place',
      originalZoom: 10,
      isUserInitiated: false,
      action: 'GEOLOC',
      center: [-2.902397, 54.901112],
      zoom: 10,
      place: 'current-place'
    }

    const payload = {
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.902397, 54.901112],
      zoom: 12,
      features: ['feature1', 'feature2']
    }

    const result = actionsMap.UPDATE(state, payload)

    expect(result).toMatchObject({
      bounds: payload.bounds,
      center: payload.center,
      zoom: payload.zoom,
      features: payload.features,
      isMoving: false,
      action: null
    })

    // Check that original values are copied over for GEOLOC action
    expect(result).toHaveProperty('oBbox', payload.bounds)
    expect(result).toHaveProperty('oCentre', payload.center)
    expect(result).toHaveProperty('rZoom', payload.zoom)
    expect(result).toHaveProperty('originalZoom', state.originalZoom)

    // Check that isUpdate is true when action is GEOLOC
    expect(result.isUpdate).toBeTruthy()
  })

  it('should handle DATA action correctly', () => {
    const state = {
      oPlace: 'old-place',
      originalZoom: 10,
      isUserInitiated: false,
      action: 'DATA',
      center: [-2.902397, 54.901112],
      zoom: 12,
      place: 'current-place'
    }

    const payload = {
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.902397, 54.901112],
      zoom: 12,
      features: ['feature1', 'feature2']
    }

    const result = actionsMap.UPDATE(state, payload)

    expect(result).toMatchObject({
      bounds: payload.bounds,
      center: payload.center,
      zoom: payload.zoom,
      features: payload.features,
      isMoving: false,
      action: null
    })

    // Check that original values are NOT copied over for DATA action (without pan/zoom)
    expect(result).not.toHaveProperty('oBbox')
    expect(result).not.toHaveProperty('oCentre')
    expect(result).not.toHaveProperty('rZoom')

    // Check that isUpdate is true when action is DATA
    expect(result.isUpdate).toBeTruthy()
  })

  it('should handle pan/zoom actions with changes correctly', () => {
    const state = {
      oPlace: 'old-place',
      originalZoom: 10,
      isUserInitiated: true,
      action: 'PAN',
      center: [-2.902397, 54.901112],
      zoom: 10,
      place: 'current-place'
    }

    const payload = {
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [5, 5],
      zoom: 12,
      features: ['feature1', 'feature2']
    }

    const result = actionsMap.UPDATE(state, payload)

    expect(result).toMatchObject({
      bounds: payload.bounds,
      center: payload.center,
      zoom: payload.zoom,
      features: payload.features,
      isMoving: false,
      action: null
    })

    // Check that original values are NOT copied over for PAN action
    expect(result).not.toHaveProperty('oBbox')
    expect(result).not.toHaveProperty('oCentre')
    expect(result).not.toHaveProperty('rZoom')

    // Check that isUpdate is true when center/zoom has changed
    expect(result.isUpdate).toBeTruthy()
  })

  it('should handle actions with no changes correctly', () => {
    const state = {
      oPlace: 'old-place',
      originalZoom: 10,
      isUserInitiated: true,
      action: 'OTHER',
      center: [-2.902397, 54.901112],
      zoom: 12,
      place: 'current-place'
    }

    const payload = {
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.902397, 54.901112],
      zoom: 12,
      features: ['feature1', 'feature2']
    }

    isSame.mockReturnValue(true)

    const result = actionsMap.UPDATE(state, payload)

    expect(result).toMatchObject({
      bounds: payload.bounds,
      center: payload.center,
      zoom: payload.zoom,
      features: payload.features,
      isMoving: false,
      action: null
    })

    // Check that isUpdate is false when no pan/zoom and not DATA/GEOLOC/INIT
    expect(result.isUpdate).toBeFalsy()
  })

  it('should preserve other existing state properties', () => {
    const state = {
      oPlace: 'old-place',
      originalZoom: 10,
      isUserInitiated: true,
      action: 'PAN',
      center: [-2.902397, 54.901112],
      zoom: 10,
      place: 'current-place',
      additionalProp1: 'value1',
      additionalProp2: 'value2'
    }

    const payload = {
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.902397, 54.901112],
      zoom: 12,
      features: ['feature1', 'feature2']
    }

    const result = actionsMap.UPDATE(state, payload)

    // Verify that additional properties are preserved
    expect(result.additionalProp1).toBe('value1')
    expect(result.additionalProp2).toBe('value2')
  })

  it('should handle pan/zoom detection correctly when only center or zoom changes', () => {
    const state = {
      oPlace: 'old-place',
      originalZoom: 10,
      isUserInitiated: true,
      action: 'PAN',
      center: [-2.902397, 54.901112],
      zoom: 12,
      place: 'current-place'
    }

    const payload = {
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.838848, 54.9376352],
      zoom: 12,
      features: ['feature1', 'feature2']
    }

    isSame.mockReturnValue(false)

    const result = actionsMap.UPDATE(state, payload)

    // Verify isUpdate is true when only center changes
    expect(result.isUpdate).toBeTruthy()
  })
})

describe('store/viewport-actions-map - updatePlace', () => {
  it('should return a new state with updated place and status when valid payload is provided', () => {
    const state = {
      center: { lat: 0, lng: 0 },
      bounds: { sw: { lat: -1, lng: -1 }, ne: { lat: 1, lng: 1 } },
      features: ['feature1', 'feature2']
    }
    const payload = { id: 1, name: 'Place 1' }

    getDescription.mockReturnValue('Description for Place 1')

    const result = actionsMap.UPDATE_PLACE(state, payload)

    expect(result).toEqual({
      ...state,
      place: payload,
      status: 'Description for Place 1',
      isUserInitiated: false,
      isStatusVisuallyHidden: true
    })
    expect(getDescription).toHaveBeenCalledWith(payload, state.bounds, state.features)
  })

  it('should handle null and empty object payloads correctly', () => {
    const state = {
      center: { lat: 0, lng: 0 },
      bounds: { sw: { lat: -1, lng: -1 }, ne: { lat: 1, lng: 1 } },
      features: ['feature1', 'feature2']
    }

    const payloads = [null, {}]

    payloads.forEach(payload => {
      getDescription.mockReturnValue('No Description')

      const result = actionsMap.UPDATE_PLACE(state, payload)

      expect(result).toEqual({
        ...state,
        place: payload,
        status: 'No Description',
        isUserInitiated: false,
        isStatusVisuallyHidden: true
      })

      expect(getDescription).toHaveBeenCalledWith(payload, state.bounds, state.features)
    })
  })

  it('should return default state if description is not found', () => {
    const state = {
      center: { lat: 0, lng: 0 },
      bounds: { sw: { lat: -1, lng: -1 }, ne: { lat: 1, lng: 1 } },
      features: ['feature1', 'feature2']
    }
    const payload = { id: 2, name: 'Place 2' }

    getDescription.mockReturnValue(undefined)

    const result = actionsMap.UPDATE_PLACE(state, payload)

    expect(result).toEqual({
      ...state,
      place: payload,
      status: undefined,
      isUserInitiated: false,
      isStatusVisuallyHidden: true
    })
  })
})

describe('store/viewport-actions-map - moveStart', () => {
  it('should return a new state with updated values based on the payload', () => {
    const state = {
      status: 'Idle',
      isMoving: false,
      isUpdate: true,
      isUserInitiated: false,
      isStatusVisuallyHidden: false,
      hasShortcuts: false
    }

    const payloads = [true, false, null, undefined]

    payloads.forEach(payload => {
      const result = actionsMap.MOVE_START(state, payload)

      expect(result).toEqual({
        ...state,
        status: '',
        isMoving: true,
        isUpdate: false,
        isUserInitiated: payload,
        isStatusVisuallyHidden: true,
        hasShortcuts: true,
        action: null
      })
    })
  })
})

describe('store/viewport-actions-map - reset', () => {
  it('should reset state correctly', () => {
    const testCases = [
      {
        initial: { oPlace: 'Original place', place: 'New place', action: 'MOVE', isUpdate: true, extra: 'data' },
        expected: { oPlace: 'Original place', place: 'Original place', action: 'RESET', isUpdate: false, extra: 'data' }
      },
      {
        initial: { oPlace: null, place: 'New place', action: 'TEST', isUpdate: true, id: 123 },
        expected: { oPlace: null, place: null, action: 'RESET', isUpdate: false, id: 123 }
      }
    ]

    testCases.forEach(({ initial, expected }) => {
      const result = actionsMap.RESET(initial)
      expect(result).toEqual(expected)
    })
  })

  it('should preserve all other properties', () => {
    const state = {
      oPlace: 'original',
      place: 'current',
      action: 'TEST',
      isUpdate: true,
      items: [1, 2, 3]
    }

    const result = actionsMap.RESET(state)

    // Check specific reset properties
    expect(result.place).toEqual('original')
    expect(result.action).toEqual('RESET')
    expect(result.isUpdate).toBe(false)

    // Check that other properties remain unchanged
    expect(result.items).toEqual(state.items)
  })
})

describe('store/viewport-actions-map - search', () => {
  let originalDateNow

  beforeEach(() => {
    originalDateNow = Date.now
    Date.now = jest.fn(() => 1646410000000)
  })

  afterEach(() => {
    Date.now = originalDateNow
  })

  it('should correctly set state properties from payload', () => {
    const testCases = [
      {
        state: {
          bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
          center: [-2.965945, 54.864555],
          zoom: 5,
          place: 'Place',
          isStatusVisuallyHidden: false,
          isUpdate: true,
          padding: [10, 10, 10, 10],
          timestamp: 123456789
        },
        payload: {
          bounds: [-2.865945, 54.764555, -2.738848, 54.837635],
          center: [-2.865945, 54.764555],
          zoom: 10,
          place: 'New place'
        }
      },
      {
        state: {},
        payload: {
          bounds: null,
          center: null,
          zoom: 0,
          place: ''
        }
      },
      {
        state: {
          bounds: [-2.865945, 54.764555, -2.738848, 54.837635],
          timestamp: 123
        },
        payload: {
          bounds: undefined,
          center: [-2.865945, 54.764555],
          zoom: 8,
          place: 'Test place'
        }
      }
    ]

    testCases.forEach(({ state, payload }) => {
      const result = actionsMap.SEARCH(state, payload)

      // Check payload properties were transferred
      expect(result.bounds).toEqual(payload.bounds)
      expect(result.center).toEqual(payload.center)
      expect(result.zoom).toEqual(payload.zoom)
      expect(result.place).toEqual(payload.place)

      // Check fixed properties
      expect(result.action).toEqual('SEARCH')
      expect(result.isStatusVisuallyHidden).toEqual(true)
      expect(result.isUpdate).toEqual(false)
      expect(result.padding).toEqual(null)
      expect(result.timestamp).toEqual(1646410000000)

      // Check existing properties are preserved
      for (const key in state) {
        if (!['bounds', 'center', 'zoom', 'place', 'action', 'isStatusVisuallyHidden', 'isUpdate', 'padding', 'timestamp'].includes(key)) {
          expect(result[key]).toEqual(state[key])
        }
      }
    })
  })

  it('should handle edge cases', () => {
    // Test with special payload values
    const state = { original: 'state' }
    const payload = {
      bounds: [-2.865945, 54.764555, -2.738848, 54.837635],
      center: [-2.865945, 54.764555],
      zoom: 0,
      place: null
    }

    const result = actionsMap.SEARCH(state, payload)

    // Verify special values are handled correctly
    expect(result.bounds).toEqual(payload.bounds)
    expect(result.place).toEqual(null)
    expect(result.original).toEqual('state')
    expect(result.timestamp).toEqual(1646410000000)
  })
})

describe('store/viewport-actions-map - geoloc', () => {
  it('should correctly update state with payload data', () => {
    const testCases = [
      {
        state: {
          place: 'old-place',
          bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
          center: [-2.838848, 54.9376352],
          status: 'Old status',
          isStatusVisuallyHidden: false,
          action: 'ACTION',
          isUpdate: true
        },
        payload: {
          place: 'Current Location',
          center: [-2.738848, 54.8376352]
        }
      },
      {
        state: { item: 'item' },
        payload: {
          place: '',
          center: [-2.738848, 54.8376352]
        }
      },
      {
        state: {
          place: 'Some place',
          status: 'Test status'
        },
        payload: {
          place: null,
          center: null
        }
      }
    ]

    testCases.forEach(({ state, payload }) => {
      const result = actionsMap.GEOLOC(state, payload)

      // Check payload properties are correctly set
      expect(result.place).toEqual(payload.place)
      expect(result.center).toEqual(payload.center)

      // Check fixed properties
      expect(result.bounds).toEqual(null)
      expect(result.status).toEqual('')
      expect(result.isStatusVisuallyHidden).toEqual(true)
      expect(result.action).toEqual('GEOLOC')
      expect(result.isUpdate).toEqual(false)

      // Check that other properties are preserved
      for (const key in state) {
        if (!['place', 'center', 'bounds', 'status', 'isStatusVisuallyHidden', 'action', 'isUpdate'].includes(key)) {
          expect(result[key]).toEqual(state[key])
        }
      }
    })
  })

  it('should handle edge cases with special values', () => {
    // Edge case with undefined in payload
    const state = {
      otherData: 'otherdata',
      place: 'Old place',
      center: [1, 1]
    }

    const payload = {
      place: undefined,
      center: [0, 0]
    }

    const result = actionsMap.GEOLOC(state, payload)

    // Check undefined is handled properly
    expect(result.place).toEqual(undefined)
    expect(result.center).toEqual([0, 0])
    expect(result.otherData).toEqual('otherdata')

    // Check fixed values
    expect(result.action).toEqual('GEOLOC')
    expect(result.isStatusVisuallyHidden).toEqual(true)
    expect(result.bounds).toEqual(null)
  })
})

describe('store/viewport-actions-map - zoomIn', () => {
  it('should add ZOOM_IN action to empty state', () => {
    expect(actionsMap.ZOOM_IN({})).toEqual({ action: 'ZOOM_IN', isUpdate: false, isUserInitiated: true })
  })

  it('should add ZOOM_IN action while preserving existing properties', () => {
    expect(actionsMap.ZOOM_IN({ key: 'value' })).toEqual({ key: 'value', action: 'ZOOM_IN', isUpdate: false, isUserInitiated: true })
  })

  it('should override existing action and isUpdate values', () => {
    expect(actionsMap.ZOOM_IN({ action: 'OLD_ACTION', isUpdate: true })).toEqual({ action: 'ZOOM_IN', isUpdate: false, isUserInitiated: true })
  })
})

describe('store/viewport-actions-map - zoomOut', () => {
  it('should add ZOOM_OUT action to empty state', () => {
    expect(actionsMap.ZOOM_OUT({})).toEqual({ action: 'ZOOM_OUT', isUpdate: false, isUserInitiated: true })
  })

  it('should add ZOOM_OUT action while preserving existing properties', () => {
    expect(actionsMap.ZOOM_OUT({ key: 'value' })).toEqual({ key: 'value', action: 'ZOOM_OUT', isUpdate: false, isUserInitiated: true })
  })

  it('should override existing action and isUpdate values', () => {
    expect(actionsMap.ZOOM_OUT({ action: 'OLD_ACTION', isUpdate: true })).toEqual({ action: 'ZOOM_OUT', isUpdate: false, isUserInitiated: true })
  })
})

describe('store/viewport-actions-map - setStyle', () => {
  it('should change dark style to default in light mode', () => {
    const state = { styles: [{ name: 'dark' }, { name: 'default' }] }
    const payload = { style: 'dark', colourScheme: 'light' }
    expect(actionsMap.SET_STYLE(state, payload)).toEqual({
      styles: [{ name: 'dark' }, { name: 'default' }],
      attributions: [],
      action: 'STYLE',
      isUpdate: false,
      style: { name: 'default' }
    })
  })

  it('should change default style to dark in dark mode', () => {
    const state = { styles: [{ name: 'dark' }, { name: 'default' }] }
    const payload = { style: 'default', colourScheme: 'dark' }
    expect(actionsMap.SET_STYLE(state, payload)).toEqual({
      styles: [{ name: 'dark' }, { name: 'default' }],
      attributions: [],
      action: 'STYLE',
      isUpdate: false,
      style: { name: 'dark' }
    })
  })

  it('should select the specified style when no override is needed', () => {
    const state = { styles: [{ name: 'deuteranopia' }, { name: 'tritanopia' }] }
    const payload = { style: 'deuteranopia', colourScheme: 'dark' }
    expect(actionsMap.SET_STYLE(state, payload)).toEqual({
      styles: [{ name: 'deuteranopia' }, { name: 'tritanopia' }],
      attributions: [],
      action: 'STYLE',
      isUpdate: false,
      style: { name: 'deuteranopia' }
    })
  })
})

describe('store/viewport-actions-map - swapStyles', () => {
  it('should swap to matching style from provided styles', () => {
    const state = { style: { name: 'dark' }, originalStyles: [{ name: 'dark' }, { name: 'default' }], originalMinZoom: 1, originalMaxZoom: 10 }
    const payload = { styles: [{ name: 'dark' }, { name: 'default' }] }
    expect(actionsMap.SWAP_STYLES(state, payload)).toEqual({
      ...state,
      action: 'STYLE',
      isUpdate: false,
      minZoom: 1,
      maxZoom: 10,
      styles: payload.styles,
      style: { name: 'dark' },
      dimensions: {}
    })
  })

  it('should fall back to first provided style if no match', () => {
    const state = { style: { name: 'nonexistent' }, originalStyles: [{ name: 'dark' }, { name: 'default' }], originalMinZoom: 1, originalMaxZoom: 10 }
    const payload = { styles: [{ name: 'dark' }, { name: 'default' }] }
    expect(actionsMap.SWAP_STYLES(state, payload)).toEqual({
      ...state,
      action: 'STYLE',
      isUpdate: false,
      minZoom: 1,
      maxZoom: 10,
      styles: payload.styles,
      style: { name: 'dark' },
      dimensions: {}
    })
  })

  it('should use originalStyles if no styles provided in payload', () => {
    const state = { style: { name: 'default' }, originalStyles: [{ name: 'dark' }, { name: 'default' }], originalMinZoom: 1, originalMaxZoom: 10 }
    expect(actionsMap.SWAP_STYLES(state, {})).toEqual({
      ...state,
      action: 'STYLE',
      isUpdate: false,
      minZoom: 1,
      maxZoom: 10,
      styles: state.originalStyles,
      style: { name: 'default' },
      dimensions: {}
    })
  })
})

describe('store/viewport-actions-map - setSize', () => {
  it('should set size and resets padding', () => {
    const state = { padding: { top: 10 }, someKey: 'value' }
    const payload = { width: 500, height: 300 }
    expect(actionsMap.SET_SIZE(state, payload)).toEqual({
      someKey: 'value',
      action: 'SIZE',
      isUpdate: false,
      padding: null,
      size: payload
    })
  })
})

describe('store/viewport-actions-map - clearStatus', () => {
  it('should clear status and reset isStatusVisuallyHidden', () => {
    const state = { status: 'error', isStatusVisuallyHidden: true, someKey: 'value' }
    expect(actionsMap.CLEAR_STATUS(state)).toEqual({
      someKey: 'value',
      status: '',
      isStatusVisuallyHidden: false
    })
  })
})

describe('store/viewport-actions-map - clearFeatures', () => {
  it('should clear features, resets status, and sets action to DATA', () => {
    const state = { features: [{ id: 1 }], status: 'Test status', action: 'OTHER' }
    expect(actionsMap.CLEAR_FEATURES(state)).toEqual({
      features: null,
      status: null,
      action: 'DATA'
    })
  })
})

describe('store/viewport-actions-map - setPadding', () => {
  it('should set padding when panel has a height', () => {
    const panel = { getBoundingClientRect: () => ({ height: 100, bottom: 150, right: 150 }) }
    const viewport = { getBoundingClientRect: () => ({ top: 50, left: 50 }), offsetHeight: 500, offsetWidth: 300 }
    const payload = { panel, viewport, isMobile: false, isAnimate: true }
    const state = {}
    expect(actionsMap.SET_PADDING(state, payload)).toEqual(expect.objectContaining({
      isAnimate: true,
      padding: expect.any(Object)
    }))
  })

  it('should return null padding when panel height is zero', () => {
    const panel = { getBoundingClientRect: () => ({ height: 0 }) }
    const viewport = { getBoundingClientRect: () => ({}) }
    const payload = { panel, viewport, isMobile: false, isAnimate: false }
    const state = {}
    expect(actionsMap.SET_PADDING(state, payload)).toEqual(expect.objectContaining({
      isAnimate: false,
      padding: null
    }))
  })
})

describe('store/viewport-actions-map - toggleShortcuts', () => {
  it('should toggle shortcut state based on payload', () => {
    const state = { hasShortcuts: false }
    expect(actionsMap.TOGGLE_SHORTCUTS(state, true)).toEqual({ hasShortcuts: true })
    expect(actionsMap.TOGGLE_SHORTCUTS(state, false)).toEqual({ hasShortcuts: false })
  })
})
