describe('panelRegistry', () => {
  let registerPanel
  let getPanelConfig

  beforeEach(() => {
    jest.resetModules()
    const module = require('./panelRegistry')
    registerPanel = module.registerPanel
    getPanelConfig = module.getPanelConfig
  })

  test('registerPanel should store a panel with showLabel default', () => {
    const panel = { settings: { title: 'Settings Panel' } }
    registerPanel(panel)
    const config = getPanelConfig()
    expect(config).toEqual({
      settings: {
        title: 'Settings Panel',
        showLabel: true
      }
    })
  })

  test('registerPanel should merge multiple panels', () => {
    const panel1 = { settings: { title: 'Settings Panel' } }
    const panel2 = { dashboard: { title: 'Dashboard Panel', showLabel: false } }
    registerPanel(panel1)
    registerPanel(panel2)
    const config = getPanelConfig()
    expect(config).toEqual({
      settings: {
        title: 'Settings Panel',
        showLabel: true
      },
      dashboard: {
        title: 'Dashboard Panel',
        showLabel: false
      }
    })
  })

  test('getPanelConfig should return the current panel config', () => {
    const panel = { reports: { title: 'Reports Panel' } }
    registerPanel(panel)
    const config = getPanelConfig()
    expect(config).toEqual({
      reports: {
        title: 'Reports Panel',
        showLabel: true
      }
    })
  })
})
