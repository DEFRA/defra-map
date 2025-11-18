import defaults from './defaults.js'

export const mergeConfig = (userConfig = {}) => {
  // Merge defaultConfig with userConfig
  const config = {
    ...defaults,
    ...userConfig
  }

  return config
}
