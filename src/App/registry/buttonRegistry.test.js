/**
 * @jest-environment jsdom
 */

import { addButton, getButtonConfig, registerButton } from './buttonRegistry.js'
import { defaultButtonConfig } from '../../config/appConfig.js'
import { deepMerge } from '../../utils/deepMerge.js'

// Mock deepMerge to behave like Object.assign for simplicity
jest.mock('../../utils/deepMerge.js', () => ({
  deepMerge: jest.fn((a, b) => ({ ...a, ...b }))
}))

describe('buttonRegistry', () => {
  it('adds a button and returns new config with button', () => {
    const newConfig = { label: 'My Button', size: 'large' }
    const id = 'button1'
    const currentConfig = {}
    const updatedConfig = addButton(currentConfig, id, newConfig)

    expect(deepMerge).toHaveBeenCalledWith(defaultButtonConfig, newConfig)
    expect(updatedConfig[id]).toEqual({ ...defaultButtonConfig, ...newConfig })
    expect(updatedConfig).not.toBe(currentConfig) // Immutable
  })

  it('can add multiple buttons', () => {
    let config = {}
    config = addButton(config, 'button1', { label: 'A' })
    config = addButton(config, 'button2', { label: 'B' })

    expect(Object.keys(config)).toEqual(['button1', 'button2'])
  })

  it('getButtonConfig returns all buttons', () => {
    const buttonConfig = {
      button1: { label: 'A', pluginId: 'plugin1' },
      button2: { label: 'B', pluginId: 'plugin2' }
    }

    const result = getButtonConfig(buttonConfig)
    expect(result).toEqual(buttonConfig)
  })

  it('getButtonConfig filters by pluginId', () => {
    const buttonConfig = {
      button1: { label: 'A', pluginId: 'plugin1' },
      button2: { label: 'B', pluginId: 'plugin2' },
      button3: { label: 'C', pluginId: 'plugin1' }
    }

    const result = getButtonConfig(buttonConfig, 'plugin1')
    expect(result).toEqual({
      button1: { label: 'A', pluginId: 'plugin1' },
      button3: { label: 'C', pluginId: 'plugin1' }
    })
  })

  it('registerButton merges new buttons into config', () => {
    const currentConfig = { button1: { label: 'A' } }
    const newButtons = { button2: { label: 'B' } }

    const updatedConfig = registerButton(currentConfig, newButtons)

    expect(updatedConfig).toEqual({
      button1: { label: 'A' },
      button2: { label: 'B' }
    })
    expect(updatedConfig).not.toBe(currentConfig) // Immutable
  })
})
