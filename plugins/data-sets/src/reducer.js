const setDataLayersProps = (state, payload) => {
  return {
    ...state,
    dataLayersProp: payload
  }
}

const initialState = {
  dataLayersProp: false
}

const actions = {
  SET_DATA_LAYERS_PROP: setDataLayersProps
}

export {
  initialState,
  actions
}
