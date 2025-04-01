import { reducer, initialState } from '../../src/js/store/app-reducer'
import { actionsMap } from '../../src/js/store/app-actions-map'

describe('app-reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(initialState, {})).toEqual(initialState)
  })

  it('should handle actions correctly', () => {
    Object.keys(actionsMap).forEach(actionType => {
      const action = { type: actionType, payload: getMockPayload(actionType) }
      const mockState = { ...initialState }
      const expectedState = actionsMap[actionType](mockState, action.payload)
      expect(reducer(mockState, action)).toEqual(expectedState)
    })
  })

  it('should return the current state if action type is not recognized', () => {
    const currentState = { ...initialState, value: 'test' }
    const action = { type: 'UNKNOWN_ACTION', payload: {} }
    expect(reducer(currentState, action)).toEqual(currentState)
  })

  it('should return the correct active panel when panel is INFO', () => {
    const currentState = { ...initialState, panel: 'INFO' }
    expect(reducer(currentState, {}).panel).toEqual('INFO')
  })

  it('should return the correct active panel when panel is LEGEND', () => {
    const currentState = { ...initialState, panel: 'LEGEND' }
    expect(reducer(currentState, {}).panel).toEqual('LEGEND')
  })

  it('should return the correct active panel when panel is KEY', () => {
    const currentState = { ...initialState, panel: 'KEY' }
    expect(reducer(currentState, {}).panel).toEqual('KEY')
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
