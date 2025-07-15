import { reducer, initialState } from '../../src/js/store/app-reducer'
import { actionsMap } from '../../src/js/store/app-actions-map'
import { getStyle } from '../../src/js/lib/viewport'

// Mock parseSegments and parseLayers to return predictable values
jest.mock('../../src/js/lib/query', () => ({
  parseSegments: jest.fn((segments) => segments ? `parsed_${segments}` : undefined),
  parseLayers: jest.fn((key) => key ? `parsed_${key}` : undefined)
}))

// Mock getStyle to return an object with a name property based on the input and getFeatureShape to return 'square'
jest.mock('../../src/js/lib/viewport', () => ({
  getStyle: jest.fn(() => ({ name: 'light' })),
  getFeatureShape: jest.fn(() => ('square'))
}))

describe('app-reducer and initialState', () => {
  describe('initialState', () => {
    it('should set activePanel to INFO when info exists with featureId', () => {
      const options = {
        styles: 'dummyStyle',
        legend: { isVisible: true, display: 'full', segments: 'segX', key: 'keyX' },
        search: {},
        info: { featureId: '123' },
        queryArea: { feature: 'dummyFeature' },
        hasAutoMode: false
      }
      const state = initialState(options)
      expect(state.activePanel).toBe('INFO')
      expect(state.segments).toBe('parsed_segX')
      expect(state.layers).toBe('parsed_keyX')
    })

    it('should set activePanel to INFO when info exists with targetMarker', () => {
      const options = {
        styles: 'dummyStyle',
        legend: {},
        search: {},
        info: { coord: [10, 20], hasData: true },
        queryArea: { feature: 'dummyFeature' },
        hasAutoMode: false
      }
      const state = initialState(options)
      expect(state.activePanel).toBe('INFO')
    })

    it('should set activePanel to LEGEND when no info and legend is visible with display "inset"', () => {
      const options = {
        styles: 'dummyStyle',
        legend: { isVisible: true, display: 'inset', segments: 'seg2', key: 'key2' },
        search: {},
        info: null,
        queryArea: { feature: 'dummyFeature' },
        hasAutoMode: false
      }
      const state = initialState(options)
      expect(state.activePanel).toBe('LEGEND')
      expect(state.segments).toBe('parsed_seg2')
      expect(state.layers).toBe('parsed_key2')
    })

    it('should set activePanel to KEY when no info and legend is visible with display compact or default', () => {
      const options = {
        styles: 'dummyStyle',
        legend: { isVisible: true, display: 'full', segments: 'seg3', key: 'key3' },
        search: {},
        info: null,
        queryArea: { feature: 'dummyFeature' },
        hasAutoMode: false
      }
      const state = initialState(options)
      expect(state.activePanel).toBe('KEY')
      expect(state.segments).toBe('parsed_seg3')
      expect(state.layers).toBe('parsed_key3')
    })

    it('should set activePanel to null when no info and legend is not visible', () => {
      const options = {
        styles: 'dummyStyle',
        legend: { isVisible: false },
        search: {},
        info: null,
        queryArea: { feature: 'dummyFeature' },
        hasAutoMode: false
      }
      const state = initialState(options)
      expect(state.activePanel).toBeNull()
      // legend is provided but no segments/key so parse functions return undefined
      expect(state.segments).toBeUndefined()
      expect(state.layers).toBeUndefined()
    })

    it('should compute isDarkMode correctly when style is dark', () => {
      getStyle.mockReturnValueOnce({ name: 'dark' })
      const options = {
        styles: 'dummyStyle',
        legend: {},
        search: {},
        info: {},
        queryArea: {},
        hasAutoMode: false
      }
      const state = initialState(options)
      expect(state.isDarkMode).toBe(true)
    })

    it('should compute isDarkMode correctly using matchMedia when auto mode is enabled', () => {
      window.matchMedia = jest.fn().mockReturnValue({ matches: true })
      getStyle.mockReturnValueOnce({ name: 'light' })
      const options = {
        styles: 'dummyStyle',
        legend: {},
        search: {},
        info: {},
        queryArea: {},
        hasAutoMode: true
      }
      const state = initialState(options)
      expect(state.isDarkMode).toBe(true)
    })
  })

  describe('reducer', () => {
    it('should return the current state when no action is provided', () => {
      const options = {
        styles: 'dummyStyle',
        legend: {},
        search: {},
        info: {},
        queryArea: {},
        hasAutoMode: false
      }
      const init = initialState(options)
      expect(reducer(init, {})).toEqual(init)
    })

    it('should handle actions correctly from actionsMap', () => {
      Object.keys(actionsMap).forEach(actionType => {
        const payload = getMockPayload(actionType)
        const options = {
          styles: 'dummyStyle',
          legend: {},
          search: {},
          info: {},
          queryArea: {},
          hasAutoMode: false
        }
        const mockState = initialState(options)
        const expectedState = actionsMap[actionType](mockState, payload)
        expect(reducer(mockState, { type: actionType, payload })).toEqual(expectedState)
      })
    })

    it('should return current state if action type is not recognized', () => {
      const options = {
        styles: 'dummyStyle',
        legend: {},
        search: {},
        info: {},
        queryArea: {},
        hasAutoMode: false
      }
      const currentState = { ...initialState(options), value: 'test' }
      expect(reducer(currentState, { type: 'UNKNOWN_ACTION', payload: {} })).toEqual(currentState)
    })
  })
})

function getMockPayload (actionType) {
  switch (actionType) {
    case 'CONTAINER_READY':
      return {}
    case 'SET_AVAILABILITY':
      return { data: {} }
    case 'SET_INFO':
      return { info: {} }
    case 'ERROR':
      return { label: 'label', message: 'message' }
    case 'CLOSE':
      return {}
    case 'SET_MODE':
      return { value: 'default ' }
    case 'SET_NEXT_SELECTED':
      return { key: 'PageDown', features: [] }
    case 'SET_IS_DARK_MODE':
      return { style: 'default', colourScheme: 'dark' }
    case 'SET_IS_TARGET_VISIBLE':
      return true
    case 'TOGGLE_SEGMENTS':
      return { segments: [], layers: [] }
    case 'TOGGLE_LAYERS':
      return []
    case 'TOGGLE_KEY_EXPANDED':
      return true
    case 'TOGGLE_VIEWPORT_LABEL':
      return { data: {} }
    default:
      return {}
  }
}
