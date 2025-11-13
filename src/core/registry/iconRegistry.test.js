describe('iconRegistry', () => {
  let registerIcon
  let getIconRegistry

  beforeEach(() => {
    jest.resetModules()
    const module = require('./iconRegistry')
    registerIcon = module.registerIcon
    getIconRegistry = module.getIconRegistry
  })

  test('getIconRegistry should contain initial close icon', () => {
    const registry = getIconRegistry()
    expect(registry).toHaveProperty('close')
  })

  test('registerIcon should add a new icon', () => {
    const newIcon = { save: () => {} }
    registerIcon(newIcon)
    const registry = getIconRegistry()
    expect(registry).toHaveProperty('close') // initial CloseIcon
    expect(registry.save).toEqual(newIcon.save) // newly added icon
  })

  test('registerIcon should merge multiple icons', () => {
    const icon1 = { save: () => {} }
    const icon2 = { cancel: () => {} }
    registerIcon(icon1)
    registerIcon(icon2)
    const registry = getIconRegistry()
    expect(registry).toHaveProperty('close')
    expect(registry.save).toEqual(icon1.save)
    expect(registry.cancel).toEqual(icon2.cancel)
  })

  test('getIconRegistry should return the current icon registry', () => {
    const icon = { edit: () => {} }
    registerIcon(icon)
    const registry = getIconRegistry()
    expect(registry).toHaveProperty('close')
    expect(registry.edit).toEqual(icon.edit)
  })
})
