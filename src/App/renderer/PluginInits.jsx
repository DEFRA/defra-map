// src/core/PluginInits.jsx
import React from 'react'
import { registeredPlugins } from '../registry/pluginRegistry.js'
import { withPluginContexts } from './pluginWrapper.js'
import { withPluginApiContexts, usePluginApiState } from './pluginApiWrapper.js'
import { useButtonStateEvaluator } from '../hooks/useButtonStateEvaluator.js'

export const PluginInits = () => {
  // Run button state evaluation after all states are initialized
  useButtonStateEvaluator()

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

        const WrappedInit = InitComponent
          ? withPluginContexts(InitComponent, {
              pluginId: plugin.id,
              pluginConfig
            })
          : null

        return WrappedInit ? (
          <WrappedInit key={`init-${plugin.id}-${idx}`} />
        ) : null
      })}
    </>
  )
}