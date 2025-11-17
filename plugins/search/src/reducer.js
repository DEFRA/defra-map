const initialState = {
  isExpanded: false,
  hasKeyboardFocusWithin: false,
  value: '',
  suggestions: [],
  isSuggestionsVisible: false,
  selectedIndex: -1
}


const toggleExpanded = (state, payload) => {
  return {
    ...state,
    isExpanded: payload,
    isSuggestionsVisible: payload
  }
}

const setKeyboardFocusWithin = (state, payload) => {
  return {
    ...state,
    hasKeyboardFocusWithin: payload,
    isSuggestionsVisible: true
  }
}

const inputBlur = (state, payload) => {
  return {
    ...state,
    hasKeyboardFocusWithin: false,
    isSuggestionsVisible: state.isSuggestionsVisible && payload !== 'keyboard',
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
    isSuggestionsVisible: true
  }
}

const hideSuggestions = (state) => {
  return {
    ...state,
    isSuggestionsVisible: false
  }
}

const setSelected = (state, payload) => {
  return {
    ...state,
    selectedIndex: payload,
    isSuggestionsVisible: payload >= 0
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
