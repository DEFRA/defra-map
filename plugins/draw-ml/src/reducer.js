const initialState = {
  mode: null,
  feature: null,
  tempFeature: null,
  selectedVertexIndex: -1,
  numVertecies: null,
  snap: false
}

const setMode = (state, payload) => {
  return {
    ...state,
    mode: payload
  }
}

const setSelectedVertexIndex = (state, payload) => {
  return {
    ...state,
    selectedVertexIndex: payload.index,
    numVertecies: payload.numVertecies
  }
}

const setFeature = (state, payload) => {
  return {
    ...state,
    feature: payload.feature === undefined ? state.feature : payload.feature,
    tempFeature: payload.tempFeature === undefined ? state.tempFeature : payload.tempFeature
  }
}

const toggleSnap = (state) => {
  return {
    ...state,
    snap: !state.snap
  }
}

const actions = {
  SET_MODE: setMode,
  SET_FEATURE: setFeature,
  SET_SELECTED_VERTEX_INDEX: setSelectedVertexIndex,
  TOGGLE_SNAP: toggleSnap
}

export {
  initialState,
  actions
}