// src/registry/createButtonRegistry.js
import { defaultButtonConfig } from '../../config/appConfig.js'
import { deepMerge } from '../../utils/deepMerge.js'

export function createButtonRegistry() {
  let buttonConfig = {}

  const registerButton = (button) => {
    buttonConfig = { ...buttonConfig, ...button }
  }

  const addButton = (id, config) => {
    const mergedConfig = deepMerge(defaultButtonConfig, config)
    buttonConfig[id] = mergedConfig
    return id
  }

  const getButtonConfig = (pluginId) => {
    if (pluginId) {
      return Object.fromEntries(
        Object.entries(buttonConfig).filter(
          ([_, btn]) => btn.pluginId === pluginId
        )
      )
    }
    return buttonConfig
  }

  const clear = () => {
    buttonConfig = {}
  }

  return {
    registerButton,
    addButton,
    getButtonConfig,
    clear
  }
}
