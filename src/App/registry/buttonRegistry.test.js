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
  beforeEach(() => {
    // Reset registry before each test
    registerButton({})
  })

  it('adds a button and returns its id', () => {
    const newConfig = { label: 'My Button', size: 'large' }
    const id = 'button1'
    const returnedId = addButton(id, newConfig)

    expect(returnedId).toBe(id)
    expect(deepMerge).toHaveBeenCalledWith(defaultButtonConfig, newConfig)

    const registry = getButtonConfig()
    expect(registry[id]).toEqual({ ...defaultButtonConfig, ...newConfig })
  })

  it('can add multiple buttons', () => {
    addButton('button1', { label: 'A' })
    addButton('button2', { label: 'B' })

    const registry = getButtonConfig()
    expect(Object.keys(registry)).toEqual(['button1', 'button2'])
  })
})
