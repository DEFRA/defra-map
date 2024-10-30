import { createMessage } from '../lib/search'

export const initialState = {
  isVisible: false,
  isExpanded: false,
  isFocusWithin: false,
  isFocusVisibleWithin: false,
  selected: -1,
  suggestions: [],
  value: '',
  message: '',
  status: ''
}

export const reducer = (state, action) => {
  switch (action.type) {
    case 'EXPAND':
      return {
        ...state,
        isExpanded: true,
        activeRef: action.activeRef
      }
    case 'COLLAPSE':
      return {
        ...state,
        isExpanded: false,
        activeRef: action.activeRef
      }
    case 'FOCUS':
      return {
        ...state,
        isVisible: true,
        isFocusWithin: true,
        isFocusVisibleWithin: action.isKeyboard,
        activeRef: null
      }
    case 'BLUR':
      return {
        ...state,
        isVisible: false,
        isFocusWithin: false,
        isFocusVisibleWithin: false
      }
    case 'MOUSEENTER':
      return {
        ...state,
        selected: -1
      }
    case 'CLICK':
      return {
        ...state,
        isVisible: true,
        isFocusVisibleWithin: action.isKeyboard,
        activeRef: action.activeRef
      }
    case 'CHANGE': {
      const value = action.value
      let suggestions = []
      if (value.length < 3) {
        suggestions = state.suggestions
      }
      return {
        ...state,
        suggestions,
        value,
        message: createMessage(suggestions, -1),
        isVisible: value.length >= 3
      }
    }
    case 'ADD_SUGGESTIONS':
      return {
        ...state,
        suggestions: action.suggestions,
        message: createMessage(action.suggestions, -1)
      }
    case 'HIDE_SUGGESTIONS':
      return {
        ...state,
        isVisible: false,
        message: createMessage(state.suggestions, -1),
        selected: -1
      }
    case 'REVIEW': {
      let index
      if (action.key === 'ArrowDown') {
        index = state.selected === state.suggestions.length - 1 ? state.selected : state.selected + 1
      } else {
        index = state.selected > 0 ? state.selected - 1 : -1
      }
      return {
        ...state,
        isVisible: true,
        selected: index,
        message: createMessage(state.suggestions, index),
        status: ''
      }
    }
    case 'SUBMIT':
      return {
        ...state,
        isVisible: false,
        value: action.value,
        message: `${state.isVisible ? 'Collapsed ' : ''}${state.selected >= 0 ? 'Completion selected' : ''}`,
        selected: -1
      }
    case 'CLEAR':
      return {
        ...state,
        isVisible: false,
        value: '',
        suggestions: [],
        activeRef: action.activeRef,
        message: 'No suggestions',
        isFocusVisibleWithin: action.isFocusVisibleWithin
      }
    case 'CLEAR_STATUS':
      return {
        ...state,
        status: ''
      }
    case 'UPDATE_STATUS':
      return {
        ...state,
        status: state.message
      }
    default:
      return state
  }
}
