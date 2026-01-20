const initialState = {
  datasets: null
}

const setDatasets = (state, payload) => {
  const { datasets, datasetDefaults } = payload
  return {
    ...state,
    datasets: datasets.map(dataset => ({
      ...datasetDefaults,
      ...dataset
    }))
  }
}

const addDataset = (state, payload) => {
  const { dataset, datasetDefaults } = payload
  return {
    ...state,
    datasets: [
      ...(state.datasets || []),
      { ...datasetDefaults, ...dataset }
    ]
  }
}

const removeDataset = (state, payload) => {
  const { id } = payload
  return {
    ...state,
    datasets: state.datasets?.filter(dataset => dataset.id !== id) || []
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
  ADD_DATASET: addDataset,
  REMOVE_DATASET: removeDataset,
  SET_DATASET_VISIBILITY: setDatasetVisibility
}

export {
  initialState,
  actions
}
