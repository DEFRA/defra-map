// src/core/hooks/useEvaluateProp.js
import { useConfig } from '../store/configContext.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { useService } from '../store/serviceContext.js'
import { useContext } from 'react'
import { PluginContext } from '../store/PluginProvider.jsx'
import { getIconRegistry } from '../registry/iconRegistry.js'
import { registeredPlugins } from '../registry/pluginRegistry.js'

export function useEvaluateProp () {
  const appConfig = useConfig()
  const appState = useApp()
  const mapState = useMap()
  const services = useService()
  const pluginContext = useContext(PluginContext)

  const ctx = {
    appConfig,
    appState,
    mapState,
    services,
    mapProvider: appConfig?.mapProvider,
    iconRegistry: getIconRegistry()
  }

  function evaluateProp (prop, pluginId) {
    let pluginConfig
    let pluginState

    if (pluginId) {
      const pluginEntry = registeredPlugins.find(p => p.id === pluginId)
      pluginConfig = pluginEntry
        ? {
            pluginId: pluginEntry.id,
            ...pluginEntry.config
          }
        : {}
      // Only include this plugin's state + dispatch
      const stateForPlugin = pluginContext?.state?.[pluginId] ?? {}
      pluginState = { ...stateForPlugin, dispatch: pluginContext?.dispatch }
    }

    const fullContext = { ...ctx, pluginConfig, pluginState }

    return pluginId && typeof prop === 'function' ? prop(fullContext) : prop
  }

  evaluateProp.ctx = ctx
  return evaluateProp
}
