// sanitiseConfig.test.js
import { sanitiseConfig } from './sanitiseConfig'
import defaults from './defaults.js'

describe('sanitiseConfig', () => {
  it('returns defaults when no userConfig is provided', () => {
    const result = sanitiseConfig()
    expect(result).toEqual(defaults)
  })

  it('merges defaults with userConfig', () => {
    const userConfig = { customKey: 'customValue' }
    const result = sanitiseConfig(userConfig)
    // should include everything from defaults, plus userConfig override
    expect(result).toMatchObject({ ...defaults, customKey: 'customValue' })
  })

  it('overrides defaults when keys overlap', () => {
    // Assume defaults has a key "theme"
    const userConfig = { theme: 'dark' }
    const result = sanitiseConfig(userConfig)
    expect(result.theme).toBe('dark')
  })
})
