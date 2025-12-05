const initialState = {
  isExpanded: false,
  hasKeyboardFocusWithin: false,
  value: '',
  suggestions: [],
  areSuggestionsVisible: false,
  selectedIndex: -1
}


const toggleExpanded = (state, payload) => {
  return {
    ...state,
    isExpanded: payload,
    areSuggestionsVisible: payload
  }
}

const setKeyboardFocusWithin = (state, payload) => {
  return {
    ...state,
    hasKeyboardFocusWithin: payload,
    areSuggestionsVisible: true
  }
}

const inputBlur = (state, payload) => {
  return {
    ...state,
    hasKeyboardFocusWithin: false,
    areSuggestionsVisible: state.areSuggestionsVisible && payload !== 'keyboard',
    selectedIndex: -1,
  }
}

const setValue = (state, payload) => {
  return {
    ...state,
    value: payload
  }
}

const updateSuggestions = (state, payload) => {
  return {
    ...state,
    suggestions: payload
  }
}

const showSuggestions = (state) => {
  return {
    ...state,
    areSuggestionsVisible: true
  }
}

const hideSuggestions = (state) => {
  return {
    ...state,
    areSuggestionsVisible: false
  }
}

const setSelected = (state, payload) => {
  return {
    ...state,
    selectedIndex: payload,
    areSuggestionsVisible: payload >= 0
  }
}

const actions = {
  TOGGLE_EXPANDED: toggleExpanded,
  SET_KEYBOARD_FOCUS_WITHIN: setKeyboardFocusWithin,
  INPUT_BLUR: inputBlur,
  SET_VALUE: setValue,
  UPDATE_SUGGESTIONS: updateSuggestions,
  SHOW_SUGGESTIONS: showSuggestions,
  HIDE_SUGGESTIONS: hideSuggestions,
  SET_SELECTED: setSelected
}

export {
  initialState,
  actions
}
