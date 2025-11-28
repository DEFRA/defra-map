// src/registry/controlRegistry.js
import { defaultControlConfig } from '../../config/appConfig.js'
import { deepMerge } from '../../utils/deepMerge.js'

let controlConfig = {}

export const registerControl = (control) => {
  controlConfig = { ...controlConfig, ...control }
}

// Add a control to the registry
export const addControl = (id, config) => {
  const mergedConfig = deepMerge(defaultControlConfig, config)

  controlConfig[id] = { id, ...mergedConfig }
  return controlConfig[id]
}

export const getControlConfig = () => controlConfig
