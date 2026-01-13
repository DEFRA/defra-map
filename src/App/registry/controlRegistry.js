// src/registry/createControlRegistry.js
import { defaultControlConfig } from '../../config/appConfig.js'
import { deepMerge } from '../../utils/deepMerge.js'

export function createControlRegistry() {
  let controlConfig = {}

  const registerControl = (control) => {
    controlConfig = { ...controlConfig, ...control }
  }

  const addControl = (id, config) => {
    const mergedConfig = deepMerge(defaultControlConfig, config)
    controlConfig[id] = { id, ...mergedConfig }
    return controlConfig[id]
  }

  const getControlConfig = () => controlConfig

  const clear = () => {
    controlConfig = {}
  }

  return {
    registerControl,
    addControl,
    getControlConfig,
    clear
  }
}
