const initialState = {
  frame: null
}

const setFrame = (state, payload) => {
  return {
    ...state,
    frame: payload
  }
}

const actions = {
  SET_FRAME: setFrame
}

export {
  initialState,
  actions
}