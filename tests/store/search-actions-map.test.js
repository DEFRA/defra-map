import { actionsMap } from '../../src/js/store/search-actions-map'
import { initialState } from '../../src/js/store/search-reducer'
import { createMessage } from '../../src/js/lib/search'
import { defaults } from '../../src/js/store/constants'

describe('search-actions-map', () => {
  const mockState = { ...initialState, suggestions: ['suggestion1', 'suggestion2'] }

  it('should handle EXPAND action', () => {
    const payload = 'activeRef'
    const expectedState = { ...mockState, isExpanded: true, activeRef: payload }
    expect(actionsMap.EXPAND(mockState, payload)).toEqual(expectedState)
  })

  it('should handle COLLAPSE action', () => {
    const payload = 'activeRef'
    const expectedState = { ...mockState, isExpanded: false, activeRef: payload }
    expect(actionsMap.COLLAPSE(mockState, payload)).toEqual(expectedState)
  })

  it('should handle FOCUS action', () => {
    const payload = true
    const expectedState = { ...mockState, isVisible: true, isFocusWithin: true, isFocusVisibleWithin: payload, activeRef: null }
    expect(actionsMap.FOCUS(mockState, payload)).toEqual(expectedState)
  })

  it('should handle BLUR action', () => {
    const expectedState = { ...mockState, isVisible: false, isFocusWithin: false, isFocusVisibleWithin: false }
    expect(actionsMap.BLUR(mockState)).toEqual(expectedState)
  })

  it('should handle MOUSEENTER action', () => {
    const expectedState = { ...mockState, selected: -1 }
    expect(actionsMap.MOUSEENTER(mockState)).toEqual(expectedState)
  })

  it('should handle CLICK action', () => {
    const payload = { isKeyboard: true, activeRef: 'activeRef' }
    const expectedState = { ...mockState, isVisible: true, isFocusVisibleWithin: payload.isKeyboard, activeRef: payload.activeRef }
    expect(actionsMap.CLICK(mockState, payload)).toEqual(expectedState)
  })

  it('should handle CHANGE action', () => {
    const payload = 'test'
    const expectedState = {
      ...mockState,
      value: payload,
      suggestions: mockState.suggestions,
      message: createMessage(mockState.suggestions, -1),
      isVisible: payload.length >= defaults.MIN_SEARCH_LENGTH
    }
    expect(actionsMap.CHANGE(mockState, payload)).toEqual(expectedState)
  })

  it('should handle SHOW_SUGGESTIONS action', () => {
    const payload = ['suggestion1', 'suggestion2']
    const expectedState = { ...mockState, suggestions: payload, message: createMessage(payload, -1) }
    expect(actionsMap.SHOW_SUGGESTIONS(mockState, payload)).toEqual(expectedState)
  })

  it('should handle HIDE_SUGGESTIONS action', () => {
    const expectedState = { ...mockState, isVisible: false, message: createMessage(mockState.suggestions, -1), selected: -1 }
    expect(actionsMap.HIDE_SUGGESTIONS(mockState)).toEqual(expectedState)
  })

  it('should handle REVIEW action', () => {
    const payload = 'ArrowDown'
    const mockStateWithSelection = { ...mockState, selected: 0 }
    const expectedState = {
      ...mockStateWithSelection,
      isVisible: true,
      selected: 1,
      message: createMessage(mockState.suggestions, 1),
      status: ''
    }
    expect(actionsMap.REVIEW(mockStateWithSelection, payload)).toEqual(expectedState)
  })

  it('should handle SUBMIT action', () => {
    const payload = 'test'
    const expectedState = {
      ...mockState,
      isVisible: false,
      value: payload,
      message: `${mockState.isVisible ? 'Collapsed ' : ''}${mockState.selected >= 0 ? 'Completion selected' : ''}`,
      selected: -1
    }
    expect(actionsMap.SUBMIT(mockState, payload)).toEqual(expectedState)
  })

  it('should handle CLEAR action', () => {
    const payload = { activeRef: 'activeRef', isFocusVisibleWithin: true }
    const expectedState = {
      ...mockState,
      isVisible: false,
      value: '',
      suggestions: [],
      activeRef: payload.activeRef,
      message: 'No suggestions',
      isFocusVisibleWithin: payload.isFocusVisibleWithin
    }
    expect(actionsMap.CLEAR(mockState, payload)).toEqual(expectedState)
  })

  it('should handle CLEAR_STATUS action', () => {
    const expectedState = { ...mockState, status: '' }
    expect(actionsMap.CLEAR_STATUS(mockState)).toEqual(expectedState)
  })

  it('should handle UPDATE_STATUS action', () => {
    const expectedState = { ...mockState, status: mockState.message }
    expect(actionsMap.UPDATE_STATUS(mockState)).toEqual(expectedState)
  })
})
