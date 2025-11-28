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

// Add a panel to the registry
export const addPanel = (id, config) => {
  const merged = deepMerge(defaultPanelConfig, config)

  panelConfig[id] = {
    ...merged,
    html: merged.html,
    render: merged.render
  }

  return id
}

// Remove a panel from the registry
export const removePanel = (id) => {
  delete panelConfig[id]
}

export const getPanelConfig = () => panelConfig
