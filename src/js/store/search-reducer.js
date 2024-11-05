import { actionsMap } from './search-actions-map'

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
  const { type, payload } = action
  const fn = actionsMap[type]
  if (fn) {
    const actionFunction = fn.bind(this, state, payload)
    return actionFunction()
  }

  return state
}
