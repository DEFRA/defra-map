// src/registry/controlRegistry.js
let controlConfig = {}

export const registerControl = (control) => {
  controlConfig = { ...controlConfig, ...control }
}

export const getControlConfig = () => controlConfig
