describe('buttonRegistry', () => {
  let registerButton
  let getButtonConfig

  beforeEach(() => {
    // Reset module state by clearing the require cache
    jest.resetModules()
    const module = require('./buttonRegistry')
    registerButton = module.registerButton
    getButtonConfig = module.getButtonConfig
  })

  test('registerButton should store button config', () => {
    const button = { save: { label: 'Save' } }
    registerButton(button)
    expect(getButtonConfig()).toEqual(button)
  })

  test('registerButton should merge multiple button configs', () => {
    const button1 = { save: { label: 'Save' } }
    const button2 = { cancel: { label: 'Cancel' } }
    registerButton(button1)
    registerButton(button2)
    expect(getButtonConfig()).toEqual({ ...button1, ...button2 })
  })

  test('getButtonConfig should return the current button config', () => {
    const button = { submit: { label: 'Submit' } }
    registerButton(button)
    expect(getButtonConfig()).toEqual(button)
  })
})
