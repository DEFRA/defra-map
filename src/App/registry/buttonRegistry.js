// src/registry/buttonRegistry.js
import { defaultButtonConfig } from '../../config/appConfig.js'
import { deepMerge } from '../../utils/deepMerge.js'

let buttonConfig = {}

export const registerButton = (button) => {
  buttonConfig = { ...buttonConfig, ...button }
}

// Add a button to the registry
export const addButton = (id, config) => {
  const mergedConfig = deepMerge(defaultButtonConfig, config)

  buttonConfig[id] = mergedConfig
  return id
}

export const getButtonConfig = () => buttonConfig
