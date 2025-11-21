import { initialState, reducer } from './mapReducer.js'
import { actionsMap } from './mapActionsMap.js'
import { registeredPlugins } from '../registry/pluginRegistry.js'

jest.mock('./mapActionsMap.js', () => ({
  actionsMap: {
    TEST_ACTION: jest.fn((state, payload) => ({ ...state, testValue: payload }))
  }
}))

jest.mock('../registry/pluginRegistry.js', () => ({
  registeredPlugins: []
}))

describe('mapReducer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    registeredPlugins.length = 0 // reset plugin list
  })

  describe('initialState', () => {
    const baseConfig = {
      center: [0, 0],
      zoom: 5,
      bounds: [1, 2, 3, 4],
      mapStyle: { id: 'style1' },
      mapSize: '100x100',
      markers: [{ id: 1, name: 'Marker1' }]
    }

    test('returns default state using mapStyle when no plugin handles map styles', () => {
      const state = initialState(baseConfig)

      expect(state).toMatchObject({
        isMapReady: false,
        mapStyle: { id: 'style1' },
        mapSize: '100x100',
        center: [0, 0],
        zoom: 5,
        bounds: [1, 2, 3, 4],
        resolution: null,
        isAtMaxZoom: null,
        isAtMinZoom: null,
        targetMarker: {
          isVisible: false,
          isPinnedToMap: false,
          state: 'active'
        },
        markers: {
          items: [{ id: 1, name: 'Marker1' }]
        }
      })
    })

    test('sets mapStyle to null when a plugin handles map styles', () => {
      registeredPlugins.push({ config: { handlesMapStyle: true } })

      const config = { ...baseConfig, mapStyle: { id: 'custom' }, center: [10, 20], zoom: 12 }
      const state = initialState(config)

      expect(state.mapStyle).toBeNull()
      expect(state.center).toEqual([10, 20])
      expect(state.zoom).toBe(12)
    })

    test('defaults markers.items to empty array when no markers are provided', () => {
      const config = { ...baseConfig, markers: undefined }
      const state = initialState(config)

      expect(state.markers.items).toEqual([])
    })
  })

  describe('reducer', () => {
    const baseState = { foo: 'bar' }

    test('calls mapped action when type exists in actionsMap', () => {
      const action = { type: 'TEST_ACTION', payload: 'newValue' }
      const result = reducer(baseState, action)

      expect(actionsMap.TEST_ACTION).toHaveBeenCalledWith(baseState, 'newValue')
      expect(result).toEqual({ foo: 'bar', testValue: 'newValue' })
    })

    test('returns original state when action type is unknown', () => {
      const action = { type: 'UNKNOWN_ACTION', payload: 'irrelevant' }
      const result = reducer(baseState, action)

      expect(result).toBe(baseState)
    })
  })
})
