// src/registry/panelRegistry.js

let panelConfig = {}

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

export const getPanelConfig = () => panelConfig
