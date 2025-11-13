import defaults from './defaults.js'

export const sanitiseConfig = (userConfig = {}) => {
  // Merge defaultConfig with userConfig
  const config = {
    ...defaults,
    ...userConfig
  }

  return config
}
