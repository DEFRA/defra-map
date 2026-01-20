const initialState = {
  datasets: null
}

const setDatasets = (state, payload) => {
  return {
    ...state,
    datasets: payload.datasets
  }
}

const setDatasetVisibility = (state, payload) => {
  const { id, visibility } = payload
  return {
    ...state,
    datasets: state.datasets?.map(dataset =>
      dataset.id === id ? { ...dataset, visibility } : dataset
    )
  }
}

const actions = {
  SET_DATASETS: setDatasets,
  SET_DATASET_VISIBILITY: setDatasetVisibility
}

export {
  initialState,
  actions
}
