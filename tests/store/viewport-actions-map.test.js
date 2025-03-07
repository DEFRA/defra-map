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
    expect(getDescription).toHaveBeenCalledWith(payload, state.center, state.bounds, state.features)
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

      expect(getDescription).toHaveBeenCalledWith(payload, state.center, state.bounds, state.features)
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
        status: 'Map move',
        isMoving: true,
        isUpdate: false,
        isUserInitiated: payload,
        isStatusVisuallyHidden: true,
        hasShortcuts: true
      })
    })
  })
})
