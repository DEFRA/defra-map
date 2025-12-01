import React from 'react'
import { render } from '@testing-library/react'
import { PluginInits } from './PluginInits.jsx'
import { registeredPlugins } from '../registry/pluginRegistry.js'

// Mock dependencies
jest.mock('../registry/pluginRegistry.js', () => ({
  registeredPlugins: []
}))

jest.mock('./pluginWrapper.js', () => ({
  withPluginContexts: jest.fn((Comp) => Comp || (() => null))
}))

jest.mock('./pluginApiWrapper.js', () => ({
  withPluginApiContexts: jest.fn((fn) => fn),
  usePluginApiState: jest.fn(() => ({ current: {} }))
}))

jest.mock('../hooks/useButtonStateEvaluator.js', () => ({
  useButtonStateEvaluator: jest.fn()
}))

jest.mock('../hooks/useInterfaceAPI.js', () => ({
  useInterfaceAPI: jest.fn()
}))

jest.mock('../hooks/useEvaluateProp.js', () => ({
  useEvaluateProp: jest.fn(() => (x) => x)
}))

jest.mock('../store/appContext.js', () => ({
  useApp: jest.fn(() => ({ mode: 'view' }))
}))

import { useButtonStateEvaluator } from '../hooks/useButtonStateEvaluator.js'
import { withPluginApiContexts } from './pluginApiWrapper.js'
import { withPluginContexts } from './pluginWrapper.js'

describe('PluginInits', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    registeredPlugins.splice(0, registeredPlugins.length)
  })

  it('calls useButtonStateEvaluator and useInterfaceAPI on render', () => {
    render(<PluginInits />)
    expect(useButtonStateEvaluator).toHaveBeenCalled()
  })

  it('renders nothing when no plugins registered', () => {
    const { container } = render(<PluginInits />)
    expect(container.textContent).toBe('')
  })

  it('renders wrapped InitComponent for plugin with InitComponent and valid mode', () => {
    const InitComp = () => <div data-testid='init' />
    registeredPlugins.push({
      id: 'plugin1',
      _originalPlugin: {},
      config: { foo: 'bar', api: {} },
      InitComponent: InitComp
    })

    const { getByTestId } = render(<PluginInits />)
    expect(getByTestId('init')).toBeTruthy()
    expect(withPluginContexts).toHaveBeenCalledWith(InitComp, expect.objectContaining({ pluginId: 'plugin1' }))
  })

  it('skips plugin without InitComponent', () => {
    registeredPlugins.push({
      id: 'plugin2',
      _originalPlugin: {},
      config: { foo: 'bar', api: {} }
    })
    const { container } = render(<PluginInits />)
    expect(container.textContent).toBe('')
  })

  it('wraps API functions onto _originalPlugin', () => {
    const mockFn = jest.fn()
    const plugin = {
      id: 'pluginApi',
      _originalPlugin: {},
      config: { foo: 'bar', api: {} },
      InitComponent: () => null,
      api: { testFn: mockFn }
    }
    registeredPlugins.push(plugin)

    render(<PluginInits />)

    expect(plugin._originalPlugin.testFn).toBeDefined()
    expect(typeof plugin._originalPlugin.testFn).toBe('function')
    expect(withPluginApiContexts).toHaveBeenCalledWith(mockFn, expect.objectContaining({ pluginId: 'pluginApi' }))
  })

  it('handles plugin with api but missing config', () => {
    const mockFn = jest.fn()
    const plugin = { id: 'pluginMissingConfig', _originalPlugin: {}, api: { testFn: mockFn } }
    registeredPlugins.push(plugin)

    render(<PluginInits />)

    expect(plugin._originalPlugin.testFn).toBeDefined()
    expect(typeof plugin._originalPlugin.testFn).toBe('function')
  })

  it('handles plugin without _originalPlugin gracefully', () => {
    const mockFn = jest.fn()
    registeredPlugins.push({ id: 'pluginNoOriginal', api: { testFn: mockFn }, config: {} })

    const { container } = render(<PluginInits />)
    expect(container.textContent).toBe('')
  })

  it('respects includeModes and excludeModes for InitComponent rendering', () => {
    const InitComp = () => <div data-testid='initMode' />
    registeredPlugins.push({
      id: 'pluginMode',
      _originalPlugin: {},
      config: { includeModes: ['edit'], excludeModes: ['view'], api: {} },
      InitComponent: InitComp
    })

    const { container } = render(<PluginInits />)
    expect(container.textContent).toBe('')
  })
})
