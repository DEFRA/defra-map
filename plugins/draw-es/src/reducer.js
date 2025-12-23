const initialState = {
  feature: null,
  mode: null
}

const setMode = (state, payload) => {
  return {
    ...state,
    mode: payload
  }
}

const setfeature = (state, payload) => {
  return {
    ...state,
    feature: payload
  }
}

const actions = {
  SET_MODE: setMode,
  SET_FEATURE: setfeature
}

export {
  initialState,
  actions
}