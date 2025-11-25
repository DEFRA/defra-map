const initialState = {
  selectedVertexIndex: -1,
  numVertecies: null,
  feature: null,
  mode: null,
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

const setfeature = (state, payload) => {
  return {
    ...state,
    feature: payload
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
  SET_SELECTED_VERTEX_INDEX: setSelectedVertexIndex,
  SET_FEATURE: setfeature,
  TOGGLE_SNAP: toggleSnap
}

export {
  initialState,
  actions
}