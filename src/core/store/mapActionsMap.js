const setMapReady = (state) => {
  return {
    ...state,
    isMapReady: true
  }
}

const mapMove = (state, payload) => {
  return {
    ...state,
    ...payload
  }
}

const mapMoveEnd = (state, payload) => {
  return {
    ...state,
    ...payload
  }
}

const mapFirstIdle = (state, payload) => {
  return {
    ...state,
    ...payload
  }
}

const setMapStyle = (state, payload) => {
  return {
    ...state,
    mapStyle: payload
  }
}

const setMapSize = (state, payload) => {
  return {
    ...state,
    mapSize: payload
  }
}

const updateTargetMarker = (state, payload) => {
  return {
    ...state,
    targetMarker: {
      ...state.targetMarker,
      ...payload
    }
  }
}

const upsertLocationMarker = (state, payload) => {
  const map = new Map(state.locationMarkers.items.map(item => [item.id, item]))
  map.set(payload.id, payload)
  const newItems = Array.from(map.values())

  return {
    ...state,
    locationMarkers: {
      ...state.locationMarkers,
      items: newItems
    }
  }
}

const removeLocationMarker = (state, payload) => {
  const newItems = state.locationMarkers.items.filter(item => item.id !== payload)

  return {
    ...state,
    locationMarkers: {
      ...state.locationMarkers,
      items: newItems
    }
  }
}

export const actionsMap = {
  SET_MAP_READY: setMapReady,
  MAP_MOVE: mapMove,
  MAP_MOVE_END: mapMoveEnd,
  MAP_FIRST_IDLE: mapFirstIdle,
  SET_MAP_STYLE: setMapStyle,
  SET_MAP_SIZE: setMapSize,
  UPDATE_TARGET_MARKER: updateTargetMarker,
  UPSERT_LOCATION_MARKER: upsertLocationMarker,
  REMOVE_LOCATION_MARKER: removeLocationMarker
}
