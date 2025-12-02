describe('panelRegistry', () => {
  let registerPanel
  let addPanel
  let removePanel
  let getPanelConfig
  let defaultPanelConfig

  beforeEach(() => {
    jest.resetModules()
    const module = require('./panelRegistry')
    registerPanel = module.registerPanel
    addPanel = module.addPanel
    removePanel = module.removePanel
    getPanelConfig = module.getPanelConfig
    defaultPanelConfig = require('../../config/appConfig.js').defaultPanelConfig
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

  // --- New tests for addPanel / removePanel ---

  test('addPanel adds a panel using deepMerge and returns it', () => {
    const id = 'analytics'
    const config = { title: 'Analytics Panel', html: '<div></div>' }
    const returned = addPanel(id, config)

    const registry = getPanelConfig()
    expect(registry[id]).toEqual({
      ...defaultPanelConfig,
      ...config,
      html: config.html,
      render: null // match defaultPanelConfig
    })
    expect(returned).toEqual(registry[id])
  })

  test('addPanel can add multiple panels', () => {
    addPanel('panel1', { title: 'Panel 1' })
    addPanel('panel2', { title: 'Panel 2', render: () => {} })

    const keys = Object.keys(getPanelConfig())
    expect(keys).toEqual(['panel1', 'panel2'])
    expect(getPanelConfig().panel1.title).toBe('Panel 1')
    expect(typeof getPanelConfig().panel2.render).toBe('function')
  })

  test('removePanel removes a panel by id', () => {
    addPanel('tempPanel', { title: 'Temp' })
    expect(getPanelConfig().tempPanel).toBeDefined()

    removePanel('tempPanel')
    expect(getPanelConfig().tempPanel).toBeUndefined()
  })
})
