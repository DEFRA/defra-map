// src/registry/createPanelRegistry.js
import { defaultPanelConfig } from '../../config/appConfig.js'
import { deepMerge } from '../../utils/deepMerge.js'

export function createPanelRegistry() {
  let panelConfig = {}

  // Register panels from config/manifest
  const registerPanel = (panel) => {
    const normalizedPanelConfig = Object.fromEntries(
      Object.entries(panel).map(([key, value]) => [
        key,
        {
          showLabel: true,
          ...value
        }
      ])
    )
    panelConfig = { ...panelConfig, ...normalizedPanelConfig }
  }

  // Add a panel to the registry at run time
  const addPanel = (id, config) => {
    const mergedConfig = deepMerge(defaultPanelConfig, config)

    panelConfig[id] = {
      ...mergedConfig,
      html: mergedConfig.html,
      render: mergedConfig.render
    }

    return panelConfig[id]
  }

  // Remove a panel from the registry at run time
  const removePanel = (id) => {
    delete panelConfig[id]
  }

  // Get the full panel config (optionally filtered later if needed)
  const getPanelConfig = () => panelConfig

  // Clear all panels (useful when unmounting map)
  const clear = () => {
    panelConfig = {}
  }

  return {
    registerPanel,
    addPanel,
    removePanel,
    getPanelConfig,
    clear
  }
}
