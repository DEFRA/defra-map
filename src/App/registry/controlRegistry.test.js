describe('controlRegistry', () => {
  let registerControl
  let getControlConfig

  beforeEach(() => {
    // Reset module state so controlConfig is fresh for each test
    jest.resetModules()
    const module = require('./controlRegistry')
    registerControl = module.registerControl
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
})
