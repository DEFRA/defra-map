import { createMessage } from '../lib/search'
import { search } from './constants'

const expand = (state, payload) => {
  return {
    ...state,
    isExpanded: true,
    activeRef: payload
  }
}

const collapse = (state, payload) => {
  return {
    ...state,
    isExpanded: false,
    activeRef: payload
  }
}

const focus = (state, payload) => {
  return {
    ...state,
    isVisible: true,
    isFocusWithin: true,
    isFocusVisibleWithin: payload,
    activeRef: null
  }
}

const blur = (state) => {
  return {
    ...state,
    isVisible: false,
    isFocusWithin: false,
    isFocusVisibleWithin: false
  }
}

const mouseenter = (state) => {
  return {
    ...state,
    selected: -1
  }
}

const click = (state, payload) => {
  return {
    ...state,
    isVisible: true,
    isFocusVisibleWithin: payload.isKeyboard,
    activeRef: payload.activeRef
  }
}

const change = (state, payload) => {
  let suggestions = state.suggestions
  if (payload.length < search.MIN_CHARS) {
    suggestions = []
  }
  return {
    ...state,
    value: payload,
    suggestions,
    message: createMessage(suggestions, -1),
    isVisible: payload.length >= search.MIN_CHARS
  }
}

const addSuggestions = (state, payload) => {
  return {
    ...state,
    suggestions: payload,
    message: createMessage(payload, -1)
  }
}

const hideSuggestions = (state) => {
  return {
    ...state,
    isVisible: false,
    message: createMessage(state.suggestions, -1),
    selected: -1
  }
}

const review = (state, payload) => {
  let index
  const current = state.selected
  const length = state.suggestions.length
  if (payload === 'ArrowDown') {
    index = current === length - 1 ? current : current + 1
  } else {
    index = current > 0 ? current - 1 : -1
  }
  return {
    ...state,
    isVisible: true,
    selected: index,
    message: createMessage(state.suggestions, index),
    status: ''
  }
}

const submit = (state, payload) => {
  return {
    ...state,
    isVisible: false,
    value: payload,
    message: `${state.isVisible ? 'Collapsed ' : ''}${state.selected >= 0 ? 'Completion selected' : ''}`,
    selected: -1
  }
}

const clear = (state, payload) => {
  return {
    ...state,
    isVisible: false,
    value: '',
    suggestions: [],
    activeRef: payload.activeRef,
    message: 'No suggestions',
    isFocusVisibleWithin: payload.isFocusVisibleWithin
  }
}

const clearStatus = (state) => {
  return {
    ...state,
    status: ''
  }
}

const updateStatus = (state) => {
  return {
    ...state,
    status: state.message
  }
}

export const actionsMap = {
  EXPAND: expand,
  COLLAPSE: collapse,
  FOCUS: focus,
  BLUR: blur,
  MOUSEENTER: mouseenter,
  CLICK: click,
  CHANGE: change,
  ADD_SUGGESTIONS: addSuggestions,
  HIDE_SUGGESTIONS: hideSuggestions,
  REVIEW: review,
  SUBMIT: submit,
  CLEAR: clear,
  CLEAR_STATUS: clearStatus,
  UPDATE_STATUS: updateStatus
}
