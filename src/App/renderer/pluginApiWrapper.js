// src/core/pluginApiWrapper.js
import React, { useRef, useEffect } from 'react'
import { useConfig } from '../store/configContext.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { useService } from '../store/serviceContext.js'
import { usePlugin } from '../store/PluginProvider.jsx'

/**
 * Wraps a plugin API function so it can be called outside React.
 *
 * Hooks are used internally to keep a ref of latest state, but the returned
 * function itself can be called from anywhere safely.
 *
 * @param {Function} fn - Original API function
 * @param {Object} options
 * @param {string} options.pluginId - Plugin ID
 * @param {Object} options.pluginConfig - Plugin config
 * @param {React.RefObject} options.stateRef - Ref holding the current state
 * @returns {Function} Wrapped function callable anywhere
 */
export function withPluginApiContexts(fn, { pluginId, pluginConfig, stateRef }) {
  return (...args) => {
    const state = stateRef.current
    if (!state) {
      throw new Error(`Plugin API "${pluginId}" called before state is initialized`)
    }
    return fn({ ...state, pluginConfig, pluginId }, ...args)
  }
}

/**
 * Hook to create a state ref for a plugin.
 *
 * Returns a ref that is updated on each render with the latest context.
 * This should be called **inside PluginInits**.
 */
export function usePluginApiState(pluginId) {
  const stateRef = useRef(null)

  const appConfig = useConfig()
  const appState = useApp()
  const mapState = useMap()
  const services = useService()
  const pluginState = usePlugin(pluginId)

  useEffect(() => {
    stateRef.current = {
      appConfig,
      appState,
      mapState,
      services,
      mapProvider: appConfig.mapProvider,
      pluginState
    }
  })

  return stateRef
}
