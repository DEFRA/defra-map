// src/core/PluginInits.jsx
import React from 'react'
import { registeredPlugins } from '../registry/pluginRegistry.js'
import { withPluginContexts } from './pluginWrapper.js'
import { withPluginApiContexts, usePluginApiState } from './pluginApiWrapper.js'
import { useInterfaceAPI } from '../hooks/useInterfaceAPI.js'
import { useApp } from '../store/appContext.js'
import { useEvaluateProp } from '../hooks/useEvaluateProp.js'
import { useButtonStateEvaluator } from '../hooks/useButtonStateEvaluator.js'

export const PluginInits = () => {
  const { mode } = useApp()

  // Add button, panel and control API methods (Needs to be top-level)
  useInterfaceAPI()

  // Evaluate reactive button states globally
  const evaluateProp = useEvaluateProp()
  useButtonStateEvaluator(evaluateProp)

  // Initialize all plugin states
  registeredPlugins.forEach((plugin) => {
    const stateRef = usePluginApiState(plugin.id)

    // Wrap all API functions
    if (plugin.api && plugin._originalPlugin) {
      Object.entries(plugin.api).forEach(([key, fn]) => {
        plugin._originalPlugin[key] = withPluginApiContexts(fn, {
          pluginId: plugin.id,
          pluginConfig: plugin?.config || {},
          stateRef
        })
      })
    }
  })

  return (
    <>
      {registeredPlugins.map((plugin, idx) => {
        const { InitComponent } = plugin
        const { api, ...pluginConfig } = plugin?.config || {}

        // Only return InitComponent if valid ode for plugin
        const { includeModes, excludeModes } = plugin.config || {}
        const inModeWhitelist = includeModes?.includes(mode) ?? true
        const inExcludeModes = excludeModes?.includes(mode) ?? false

        const WrappedInit = inModeWhitelist && !inExcludeModes && InitComponent
          ? withPluginContexts(InitComponent, {
            pluginId: plugin.id,
            pluginConfig
          })
          : null

        return WrappedInit
          ? (
            <WrappedInit key={`init-${plugin.id}-${idx}`} />
            )
          : null
      })}
    </>
  )
}
