import { getBreakpoint, subscribeToBreakpointChange } from '../utils/detectBreakpoint.js'
import { getQueryParam } from '../utils/queryString.js'
import defaults from '../config/defaults.js'

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Determines whether a component should be loaded based on configuration
 * and the current breakpoint.
 *
 * @param {Object} config - Component configuration.
 * @param {string} config.id - The view/component ID.
 * @param {string} config.behaviour - The behaviour mode ("buttonFirst", "mapOnly", "inline", "hybrid").
 * @returns {boolean} True if the component should be loaded.
 */
function shouldLoadComponent (config) {
  const { id, behaviour } = config
  const breakpoint = getBreakpoint()
  const hasViewParam = getQueryParam(defaults.mapViewParamKey) === id

  return ['mapOnly', 'inline'].includes(behaviour) ||
    (behaviour === 'hybrid' && breakpoint !== 'mobile') ||
    hasViewParam
}

/**
 * Sets up component behaviour based on map configuration.
 *
 * For behaviours `"buttonFirst"` or `"hybrid"`, subscribes to breakpoint changes
 * and dynamically loads/removes the component.
 *
 * @param {Object} mapInstance - Map instance containing config and methods.
 * @param {Object} mapInstance.config - Configuration object.
 * @param {Function} mapInstance.loadComponent - Function to load the component.
 * @param {Function} mapInstance.removeComponent - Function to remove the component.
 * @returns {void}
 */
function setupBehavior (mapInstance) {
  const { behaviour } = mapInstance.config

  if (['buttonFirst', 'hybrid'].includes(behaviour)) {
    subscribeToBreakpointChange(() => {
      if (shouldLoadComponent(mapInstance.config)) {
        mapInstance.loadComponent()
      } else {
        mapInstance.removeComponent()
      }
    })
  }
}

export {
  setupBehavior,
  shouldLoadComponent
}
