import { actionsMap } from './mapActionsMap.js'
import { registeredPlugins } from '../registry/pluginRegistry.js'

export const initialState = (config) => {
  const {
    center,
    zoom,
    bounds,
    mapStyle,
    mapSize,
    markers
  } = config

  // Does a plugin handle map styles
  const pluginHandlesMapStyles = !!registeredPlugins?.find(plugin => plugin.config?.handlesMapStyle)

  return {
    isMapReady: false,
    mapStyle: !pluginHandlesMapStyles ? mapStyle : null,
    mapSize,
    center,
    zoom,
    bounds,
    resolution: null,
    isAtMaxZoom: null,
    isAtMinZoom: null,

    // Full target marker state
    crossHair: {
      isVisible: false,
      isPinnedToMap: false,
      state: 'active'
    },

    // Markers
    markers: {
      items: markers || []
    }
  }
}

export const reducer = (state, action) => {
  const { type, payload } = action
  const fn = actionsMap[type]
  if (fn) {
    return fn(state, payload)
  }
  return state
}
