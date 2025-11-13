import React from 'react'
import { render } from '@testing-library/react'
import { initialiseApp } from './initialiseApp.js'
import { createRoot } from 'react-dom/client'
import eventBus from '../../services/eventBus.js'
import { registerPanel } from '../registry/panelRegistry.js'
import { registerPlugin, registeredPlugins } from '../registry/pluginRegistry.js'
import { setProviderSupportedShortcuts } from '../registry/keyboardShortcutRegistry.js'
import { PluginInits } from '../renderer/PluginInits.jsx'

// Mock all dependencies
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: jest.fn(), unmount: jest.fn() }))
}))
jest.mock('../../services/eventBus.js', () => ({ on: jest.fn(), off: jest.fn(), emit: jest.fn() }))
jest.mock('../../config/appConfig.js', () => ({ appConfig: { panels: [{ id: 'panel1' }, { id: 'panel2' }] } }))
jest.mock('../registry/panelRegistry.js', () => ({ registerPanel: jest.fn() }))
jest.mock('../registry/pluginRegistry.js', () => ({ registerPlugin: jest.fn(), registeredPlugins: [] }))
jest.mock('../registry/keyboardShortcutRegistry.js', () => ({ setProviderSupportedShortcuts: jest.fn() }))
jest.mock('../registry/mergeManifests.js', () => ({ mergeManifests: jest.fn((base, override) => ({ ...base, ...override })) }))
jest.mock('./App.jsx', () => ({ App: jest.fn(() => <div>App</div>) }))

describe('initialiseApp', () => {
  let rootElement, MapProviderMock

  const createMapProviderMock = (capabilities) => {
    return jest.fn(function ({ mapFramework, eventBus }) {
      this.mapFramework = mapFramework
      this.eventBus = eventBus
      if (capabilities) this.capabilities = capabilities
    })
  }

  const createPlugin = (overrides = {}) => ({
    id: 'plugin1',
    load: jest.fn(() => Promise.resolve({
      InitComponent: jest.fn(),
      api: { foo: jest.fn() },
      manifest: { version: '1.0' },
      ...overrides
    }))
  })

  beforeEach(() => {
    rootElement = document.createElement('div')
    MapProviderMock = createMapProviderMock({ supportedShortcuts: ['ctrl+a'] })
    jest.clearAllMocks()
    registeredPlugins.length = 0
  })

  test('initialises app with provider shortcuts and registers panels/plugins', async () => {
    const plugin = createPlugin()
    const app = await initialiseApp(rootElement, {
      MapProvider: MapProviderMock,
      mapFramework: 'mockFramework',
      plugins: [plugin]
    })

    expect(MapProviderMock).toHaveBeenCalledWith({ mapFramework: 'mockFramework', eventBus })
    expect(setProviderSupportedShortcuts).toHaveBeenCalledWith(['ctrl+a'])
    expect(registerPanel).toHaveBeenCalledTimes(2)
    expect(plugin.load).toHaveBeenCalled()
    expect(registerPlugin).toHaveBeenCalledWith(expect.objectContaining({ id: 'plugin1' }))
    expect(app.on).toBe(eventBus.on)
    expect(app.off).toBe(eventBus.off)
    expect(app.emit).toBe(eventBus.emit)

    app.unmount()
    expect(createRoot.mock.results[0].value.unmount).toHaveBeenCalled()
    expect(registeredPlugins.length).toBe(0)
  })

  test('falls back if MapProvider has no supportedShortcuts', async () => {
    await initialiseApp(rootElement, { MapProvider: createMapProviderMock(), mapFramework: 'test' })
    expect(setProviderSupportedShortcuts).not.toHaveBeenCalled()
  })

  test('reuses cached MapProvider and root instances', async () => {
    await initialiseApp(rootElement, { MapProvider: MapProviderMock, mapFramework: 'test' })
    jest.clearAllMocks()

    await initialiseApp(rootElement, { MapProvider: MapProviderMock, mapFramework: 'test' })

    expect(MapProviderMock).not.toHaveBeenCalled()
    expect(createRoot).not.toHaveBeenCalled()
  })

  test('creates new instances for different elements', async () => {
    await initialiseApp(document.createElement('div'), { MapProvider: MapProviderMock, mapFramework: 'test' })
    await initialiseApp(document.createElement('div'), { MapProvider: MapProviderMock, mapFramework: 'test' })

    expect(MapProviderMock).toHaveBeenCalledTimes(2)
    expect(createRoot).toHaveBeenCalledTimes(2)
  })

  test('skips plugins without load function', async () => {
    await initialiseApp(rootElement, {
      MapProvider: MapProviderMock,
      mapFramework: 'test',
      plugins: [{ id: 'noLoad', someOtherProp: 'value' }]
    })

    expect(registerPlugin).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'noLoad' }))
  })

  test('handles plugin without api', async () => {
    const plugin = createPlugin({ api: undefined })
    await initialiseApp(rootElement, {
      MapProvider: MapProviderMock,
      mapFramework: 'test',
      plugins: [plugin]
    })

    expect(registerPlugin).toHaveBeenCalledWith(expect.objectContaining({ id: 'plugin1' }))
  })

  test('wraps plugin API functions via PluginInits', async () => {
    const apiFn = jest.fn()
    const plugin = createPlugin({ api: { foo: apiFn } })

    await initialiseApp(rootElement, { MapProvider: MapProviderMock, mapFramework: 'test', plugins: [plugin] })
    render(<PluginInits />)

    expect(registerPlugin).toHaveBeenCalledWith(expect.objectContaining({ 
      id: 'plugin1',
      _originalPlugin: plugin
    }))

    const registeredPlugin = registerPlugin.mock.calls[0][0]
    expect(registeredPlugin.api.foo).toBe(apiFn)
  })
})