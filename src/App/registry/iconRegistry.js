// src/App/registry/iconRegistry.js
let iconRegistry = {
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
}

export const registerIcon = (icon) => {
  iconRegistry = { ...iconRegistry, ...icon }
}

export const getIconRegistry = () => iconRegistry
