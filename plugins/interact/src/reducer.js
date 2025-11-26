const initialState = {
  selectedFeatures: [],
  selectionBounds: null
}

/**
 * Toggle a feature in the selectedFeatures Set.
 * Structure of items in Set: { featureId: string, layerId: string, idProperty: string }
 */
const toggleSelectedFeatures = (state, payload) => {
  const { featureId, multiSelect, layerId, idProperty, addToExisting } = payload
  const selected = Array.isArray(state.selectedFeatures) ? [...state.selectedFeatures] : []

  const existingIndex = selected.findIndex(
    f => f.featureId === featureId && f.layerId === layerId
  )

  // Add-only mode with multiSelect
  if (addToExisting && multiSelect) {
    if (existingIndex === -1) {
      selected.push({ featureId, layerId, idProperty })
    }
    return { ...state, selectedFeatures: selected }
  }

  // Multi-select logic
  if (multiSelect) {
    if (existingIndex !== -1) {
      selected.splice(existingIndex, 1) // remove
    } else {
      selected.push({ featureId, layerId, idProperty })
    }
    return { ...state, selectedFeatures: selected }
  }

  // Single-select logic
  const isSameSingle = existingIndex !== -1 && selected.length === 1
  const newSelected = isSameSingle ? [] : [{ featureId, layerId, idProperty }]

  return { ...state, selectedFeatures: newSelected }
}


// Update bounds (called from useEffect after map provider calculates them)
const updateSelectedBounds = (state, payload) => {
  const { bounds } = payload
  return {
    ...state,
    selectionBounds: bounds
  }
}

const clearSelectedFeatures = (state) => {
  return {
    ...state,
    selectedFeatures: [],
    selectionBounds: null
  }
}

const actions = {
  TOGGLE_SELECTED_FEATURES: toggleSelectedFeatures,
  UPDATE_SELECTED_BOUNDS: updateSelectedBounds,
  CLEAR_SELECTED_FEATURES: clearSelectedFeatures
}

export {
  initialState,
  actions
}