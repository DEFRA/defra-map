import { reducer, initialState } from '../../src/js/store/search-reducer'
import { actionsMap } from '../../src/js/store/search-actions-map'

describe('search-reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(initialState, {})).toEqual(initialState)
  })

  it('should handle actions correctly', () => {
    Object.keys(actionsMap).forEach(actionType => {
      const action = { type: actionType, payload: getMockPayload(actionType) }
      const mockState = { ...initialState, suggestions: ['suggestion1', 'suggestion2'] }
      const expectedState = actionsMap[actionType](mockState, action.payload)
      expect(reducer(mockState, action)).toEqual(expectedState)
    })
  })

  it('should return the current state if action type is not recognized', () => {
    const currentState = { ...initialState, value: 'test' }
    const action = { type: 'UNKNOWN_ACTION', payload: {} }
    expect(reducer(currentState, action)).toEqual(currentState)
  })
})

function getMockPayload (actionType) {
  switch (actionType) {
    case 'SET_SUGGESTIONS':
      return ['suggestion1', 'suggestion2']
    case 'SET_SELECTED':
      return 1
    case 'SET_VALUE':
      return 'test'
    case 'SET_VISIBILITY':
      return true
    case 'SET_EXPANDED':
      return true
    case 'SET_FOCUS_WITHIN':
      return true
    case 'SET_FOCUS_VISIBLE_WITHIN':
      return true
    case 'SET_MESSAGE':
      return 'test message'
    case 'SET_STATUS':
      return 'test status'
    default:
      return {}
  }
}
