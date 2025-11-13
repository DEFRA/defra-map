const initialState = {
  selectedVertexIndex: -1,
  numVertecies: null,
  featureGeoJSON: null,
  mode: null,
  feature: null
}

const initState = (state, payload) => {
  return {
    ...state,
    featureGeoJSON: payload.featureGeoJSON,
    mode: payload.featureGeoJSON ? 'edit_vertex' : 'draw_vertex'
  }
}

const setSelectedVertexIndex = (state, payload) => {
  return {
    ...state,
    selectedVertexIndex: payload.index,
    numVertecies: payload.numVertecies
  }
}

const setMode = (state, payload) => {
  return {
    ...state,
    mode: payload
  }
}

const setfeatureGeoJSON = (state, payload) => {
  return {
    ...state,
    featureGeoJSON: payload
  }
}

const actions = {
  INIT_STATE: initState,
  SET_SELECTED_VERTEX_INDEX: setSelectedVertexIndex,
  SET_FEATURE_GEOJSON: setfeatureGeoJSON,
  SET_MODE: setMode
}

export {
  initialState,
  actions
}