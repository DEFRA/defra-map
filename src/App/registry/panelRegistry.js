// src/registry/panelRegistry.js
import { defaultPanelConfig } from '../../config/appConfig.js'
import { deepMerge } from '../../utils/deepMerge.js'

let panelConfig = {}

// Register a panel from config/manifest
export const registerPanel = (panel) => {
  const normalizedPanelConfig = Object.fromEntries(
    Object.entries(panel).map(([key, value]) => [
      key, {
        showLabel: true,
        ...value
      }
    ])
  )
  panelConfig = { ...panelConfig, ...normalizedPanelConfig }
}

// Add a panel to the registry at run time
export const addPanel = (id, config) => {
  const mergedConfig = deepMerge(defaultPanelConfig, config)

  panelConfig[id] = {
    ...mergedConfig,
    html: mergedConfig.html,
    render: mergedConfig.render
  }

  return panelConfig[id]
}

// Remove a panel from the registry at run time
export const removePanel = (id) => {
  delete panelConfig[id]
}

export const getPanelConfig = () => panelConfig
