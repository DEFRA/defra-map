const initialState = {
  selectedFeatures: new Set(),
  selectionBounds: null
}

/**
 * Toggle a feature in the selectedFeatures Set.
 * Structure of items in Set: { featureId: string, layerId: string, idProperty: string }
 */
const toggleSelectedFeatures = (state, payload) => {
  const { featureId, multiSelect, layerId, idProperty, addToExisting } = payload
  const set = new Set(state.selectedFeatures)

  const existing = [...set].find(f => f.featureId === featureId && f.layerId === layerId)

  // Add-only
  if (addToExisting && multiSelect) {
    if (!existing) {
      set.add({ featureId, layerId, idProperty })
    }
    return { ...state, selectedFeatures: [...set] }
  }

  // Multi-select logic
  if (multiSelect) {
    if (existing) {
      set.delete(existing)
    } else {
      set.add({ featureId, layerId, idProperty })
    }
    return { ...state, selectedFeatures: [...set] }
  }

  // Single-select logic
  const isSameSingle = existing && set.size === 1

  set.clear()

  if (!isSameSingle) {
    set.add({ featureId, layerId, idProperty })
  }

  return { ...state, selectedFeatures: [...set] }
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
    selectedFeatures: new Set(),
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