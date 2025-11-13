import React from 'react'
import { render } from '@testing-library/react'
import { PluginInits } from './PluginInits.jsx'
import { registeredPlugins } from '../registry/pluginRegistry.js'

// Mock dependencies
jest.mock('../registry/pluginRegistry.js', () => ({
  registeredPlugins: []
}))

jest.mock('./pluginWrapper.js', () => ({
  withPluginContexts: (Comp) => Comp || (() => null)
}))

jest.mock('./pluginApiWrapper.js', () => ({
  withPluginApiContexts: (fn) => fn, // just return original for testing
  usePluginApiState: jest.fn(() => ({ current: {} }))
}))

jest.mock('../hooks/useButtonStateEvaluator.js', () => ({
  useButtonStateEvaluator: jest.fn()
}))

import { useButtonStateEvaluator } from '../hooks/useButtonStateEvaluator.js'

describe('PluginInits', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    registeredPlugins.splice(0, registeredPlugins.length)
  })

  it('calls useButtonStateEvaluator on render', () => {
    render(<PluginInits />)
    expect(useButtonStateEvaluator).toHaveBeenCalled()
  })

  it('renders nothing when no plugins registered', () => {
    const { container } = render(<PluginInits />)
    expect(container.textContent).toBe('')
  })

  it('renders wrapped InitComponent for plugins with InitComponent', () => {
    const InitComp = () => <div data-testid='init' />
    registeredPlugins.push({
      id: 'plugin1',
      _originalPlugin: {},
      config: { foo: 'bar', api: {} },
      InitComponent: InitComp
    })

    const { getByTestId } = render(<PluginInits />)
    expect(getByTestId('init')).toBeTruthy()
  })

  it('skips plugins without InitComponent', () => {
    registeredPlugins.push({
      id: 'plugin2',
      _originalPlugin: {},
      config: { foo: 'bar', api: {} }
    })
    const { container } = render(<PluginInits />)
    expect(container.textContent).toBe('')
  })

  it('handles plugin with api but missing config', () => {
    const mockFn = jest.fn()
    const plugin = {
      id: 'pluginMissingConfig',
      _originalPlugin: {},
      api: { testFn: mockFn }
      // config is intentionally missing
    }
    registeredPlugins.push(plugin)

    render(<PluginInits />)

    expect(plugin._originalPlugin.testFn).toBeDefined()
    expect(typeof plugin._originalPlugin.testFn).toBe('function')
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

    // API function should be assigned to _originalPlugin
    expect(plugin._originalPlugin.testFn).toBeDefined()
    expect(typeof plugin._originalPlugin.testFn).toBe('function')
  })

  it('handles plugin without _originalPlugin gracefully', () => {
    const mockFn = jest.fn()
    registeredPlugins.push({
      id: 'pluginNoOriginal',
      api: { testFn: mockFn },
      config: {}
    })

    const { container } = render(<PluginInits />)
    expect(container.textContent).toBe('')
  })
})
