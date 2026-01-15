import { registerControl, addControl, getControlConfig } from './controlRegistry.js'
import { defaultControlConfig } from '../../config/appConfig.js'

jest.mock('../../utils/deepMerge.js', () => ({
  deepMerge: jest.fn((a, b) => ({ ...a, ...b }))
}))

describe('controlRegistry', () => {
  test('registerControl should store control config', () => {
    const control = { slider: { min: 0, max: 100 } }
    const config = registerControl({}, control)
    expect(config).toEqual(control)
  })

  test('registerControl should merge multiple control configs', () => {
    const control1 = { slider: { min: 0, max: 100 } }
    const control2 = { toggle: { default: true } }
    let config = {}
    config = registerControl(config, control1)
    config = registerControl(config, control2)
    expect(config).toEqual({ ...control1, ...control2 })
  })

  test('getControlConfig should return the current control config', () => {
    const control = { input: { placeholder: 'Enter text' } }
    const config = registerControl({}, control)
    const result = getControlConfig(config)
    expect(result).toEqual(control)
  })

  test('addControl adds a control to config', () => {
    const config = { min: 0, max: 10 }
    const id = 'slider1'
    const currentConfig = {}

    const updatedConfig = addControl(currentConfig, id, config)

    expect(updatedConfig[id]).toEqual({ id, ...defaultControlConfig, ...config })
    expect(updatedConfig).not.toBe(currentConfig) // Immutable
  })

  test('addControl can add multiple controls', () => {
    let config = {}
    config = addControl(config, 'control1', { foo: 'bar' })
    config = addControl(config, 'control2', { baz: 'qux' })

    expect(Object.keys(config)).toEqual(['control1', 'control2'])
    expect(config.control1).toEqual({ id: 'control1', ...defaultControlConfig, foo: 'bar' })
    expect(config.control2).toEqual({ id: 'control2', ...defaultControlConfig, baz: 'qux' })
  })
})

describe('createControlRegistry', () => {
  let registry

  beforeEach(() => {
    const { createControlRegistry } = require('./controlRegistry.js')
    registry = createControlRegistry()
  })

  test('registerControl adds control to internal config', () => {
    registry.registerControl({ slider: { min: 0 } })
    expect(registry.getControlConfig()).toEqual({ slider: { min: 0 } })
  })

  test('addControl adds control and returns the control config', () => {
    const result = registry.addControl('ctrl1', { label: 'Test' })
    expect(result.id).toBe('ctrl1')
    expect(registry.getControlConfig().ctrl1).toBeDefined()
  })

  test('getControlConfig returns all controls', () => {
    registry.registerControl({ slider: { min: 0 } })
    registry.registerControl({ toggle: { default: true } })
    const config = registry.getControlConfig()
    expect(config).toEqual({ slider: { min: 0 }, toggle: { default: true } })
  })

  test('clear resets internal config', () => {
    registry.registerControl({ slider: { min: 0 } })
    registry.clear()
    expect(registry.getControlConfig()).toEqual({})
  })
})
