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

// Dynamic methods
export const addPanel = (id, config) => {
  const configWithDefaults = {
    ...config,
    mobile: config.mobile && { initiallyOpen: true, ...config.mobile },
    tablet: config.tablet && { initiallyOpen: true, ...config.tablet },
    desktop: config.desktop && { initiallyOpen: true, ...config.desktop },
  }

  panelConfig[id] = {
    showLabel: true,
    ...configWithDefaults,
    render: config.html
      ? () => <div dangerouslySetInnerHTML={{ __html: config.html }} />
      : config.render
  }

  return id
}

export const removePanel = (id) => {
  delete panelConfig[id]
}

export const getPanelConfig = () => panelConfig
