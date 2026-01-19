const initialState = {
  dataSets: null
}

const setDataSets = (state, payload) => {
  return {
    ...state,
    dataSets: payload
  }
}

const setDataSetVisibility = (state, payload) => {
  const { id, visibility } = payload
  return {
    ...state,
    dataSets: state.dataSets.map(dataSet =>
      dataSet.id === id ? { ...dataSet, visibility } : dataSet
    )
  }
}

const actions = {
  SET_DATA_SETS: setDataSets,
  SET_DATA_SET_VISIBILITY: setDataSetVisibility
}

export {
  initialState,
  actions
}
