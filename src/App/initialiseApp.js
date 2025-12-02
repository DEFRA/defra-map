import { createRoot } from 'react-dom/client'
import eventBus from '../services/eventBus.js'
import { appConfig } from '../config/appConfig.js'
import { registerPlugin, registeredPlugins } from './registry/pluginRegistry.js'
import { setProviderSupportedShortcuts } from './registry/keyboardShortcutRegistry.js'
import { mergeManifests } from './registry/mergeManifests.js'
import { App } from './App.jsx'

const rootMap = new WeakMap()
const mapProviderMap = new WeakMap()

export async function initialiseApp (rootElement, {
  MapProvider: MapProviderClass,
  mapProviderConfig,
  mapFramework,
  plugins = [],
  ...restProps
}) {
  // Reuse or create mapProvider
  let mapProvider = mapProviderMap.get(rootElement)
  if (!mapProvider) {
    mapProvider = new MapProviderClass({ mapFramework, mapProviderConfig, eventBus })
    mapProviderMap.set(rootElement, mapProvider)
  }

  // Register provider-supported shortcuts
  if (mapProvider.capabilities?.supportedShortcuts) {
    setProviderSupportedShortcuts(mapProvider.capabilities.supportedShortcuts)
  }

  // Clear previous plugins
  registeredPlugins.length = 0

  // Register default appConfig as a plugin
  registerPlugin({
    id: 'appConfig',
    manifest: appConfig
  })

  // Create root if not already present
  let root = rootMap.get(rootElement)
  if (!root) {
    root = createRoot(rootElement)
    rootMap.set(rootElement, root)
  }

  const appInstance = {
    _root: root,

    // Direct references instead of bound functions for easier testing
    on: eventBus.on,
    off: eventBus.off,
    emit: eventBus.emit,

    unmount () {
      root.unmount()
      rootMap.delete(rootElement)
      mapProvider.destroyMap?.()
      mapProviderMap.delete(rootElement)
      registeredPlugins.length = 0
    }
  }

  // Load plugins
  for (const plugin of plugins) {
    if (typeof plugin.load === 'function') {
      const module = await plugin.load()
      const { id: pluginId, load, manifest: overrideManifest, ...config } = plugin
      const { InitComponent, api, reducer, ...baseManifest } = module

      // Merge runtime overrides with module manifest
      const manifest = mergeManifests(baseManifest, overrideManifest)

      registerPlugin({
        id: pluginId,
        InitComponent,
        api,
        reducer,
        config,
        manifest,
        _originalPlugin: plugin
      })
    }
  }

  root.render(<App {...restProps} mapProvider={mapProvider} />)

  return appInstance
}
