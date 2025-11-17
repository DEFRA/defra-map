export const createInputHandlers = ({ dispatch, debouncedFetchSuggestions, services }) => ({
  handleInputClick() {
    dispatch({ type: 'SHOW_SUGGESTIONS' })
  },

  handleInputFocus(interfaceType) {
    dispatch({ type: 'SET_KEYBOARD_FOCUS_WITHIN', payload: interfaceType === 'keyboard' })
  },

  handleInputBlur(interfaceType) {
    dispatch({ type: 'INPUT_BLUR', payload: interfaceType })
  },

  handleInputChange(e) {
    const value = e.target.value
    dispatch({ type: 'SET_VALUE', payload: value })

    if (value.length < 3) {
      debouncedFetchSuggestions.cancel()
      dispatch({ type: 'UPDATE_SUGGESTIONS', payload: [] })
      dispatch({ type: 'HIDE_SUGGESTIONS' })
      return
    }

    dispatch({ type: 'SHOW_SUGGESTIONS' })
    debouncedFetchSuggestions(value)
  },

  handleTouchStart(e, inputRef) {
    if (!inputRef.current?.contains(e.target)) {
      inputRef.current?.blur()
    }
  }
})
