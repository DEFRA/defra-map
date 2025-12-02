import { defaultControlConfig } from '../../config/appConfig.js'

jest.mock('../../utils/deepMerge.js', () => ({
  deepMerge: jest.fn((a, b) => ({ ...a, ...b }))
}))

describe('controlRegistry', () => {
  let registerControl, addControl, getControlConfig

  beforeEach(() => {
    jest.resetModules()
    const module = require('./controlRegistry.js')
    registerControl = module.registerControl
    addControl = module.addControl
    getControlConfig = module.getControlConfig
  })

  test('registerControl should store control config', () => {
    const control = { slider: { min: 0, max: 100 } }
    registerControl(control)
    expect(getControlConfig()).toEqual(control)
  })

  test('registerControl should merge multiple control configs', () => {
    const control1 = { slider: { min: 0, max: 100 } }
    const control2 = { toggle: { default: true } }
    registerControl(control1)
    registerControl(control2)
    expect(getControlConfig()).toEqual({ ...control1, ...control2 })
  })

  test('getControlConfig should return the current control config', () => {
    const control = { input: { placeholder: 'Enter text' } }
    registerControl(control)
    expect(getControlConfig()).toEqual(control)
  })

  test('addControl adds a control and returns it', () => {
    const config = { min: 0, max: 10 }
    const id = 'slider1'

    const returned = addControl(id, config)

    const registry = getControlConfig()
    expect(registry[id]).toEqual({ id, ...defaultControlConfig, ...config })
    expect(returned).toEqual({ id, ...defaultControlConfig, ...config })
  })

  test('addControl can add multiple controls', () => {
    const { addControl, getControlConfig } = require('./controlRegistry.js')
    addControl('control1', { foo: 'bar' })
    addControl('control2', { baz: 'qux' })

    const registry = getControlConfig()
    expect(Object.keys(registry)).toEqual(['control1', 'control2'])
    expect(registry.control1).toEqual({ id: 'control1', ...defaultControlConfig, foo: 'bar' })
    expect(registry.control2).toEqual({ id: 'control2', ...defaultControlConfig, baz: 'qux' })
  })
})
