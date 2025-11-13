// src/registry/buttonRegistry.js
let buttonConfig = {}

export const registerButton = (button) => {
  buttonConfig = { ...buttonConfig, ...button }
}

export const getButtonConfig = () => buttonConfig
