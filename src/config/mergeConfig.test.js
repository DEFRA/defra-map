// mergeConfig.test.js
import { mergeConfig } from './mergeConfig.js'
import defaults from './defaults.js'

describe('mergeConfig', () => {
  it('returns defaults when no userConfig is provided', () => {
    const result = mergeConfig()
    expect(result).toEqual(defaults)
  })

  it('merges defaults with userConfig', () => {
    const userConfig = { customKey: 'customValue' }
    const result = mergeConfig(userConfig)
    // should include everything from defaults, plus userConfig override
    expect(result).toMatchObject({ ...defaults, customKey: 'customValue' })
  })

  it('overrides defaults when keys overlap', () => {
    // Assume defaults has a key "theme"
    const userConfig = { theme: 'dark' }
    const result = mergeConfig(userConfig)
    expect(result.theme).toBe('dark')
  })
})
