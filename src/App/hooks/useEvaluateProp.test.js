import React from 'react'
import { renderHook } from '@testing-library/react'
import { useEvaluateProp } from './useEvaluateProp.js'
import * as configStore from '../store/configContext.js'
import * as appStore from '../store/appContext.js'
import * as mapStore from '../store/mapContext.js'
import * as serviceStore from '../store/serviceContext.js'
import { PluginContext } from '../store/PluginProvider.jsx'
import * as iconRegistryModule from '../registry/iconRegistry.js'

// --- Mock the dependencies ---
jest.mock('../store/configContext.js', () => ({ useConfig: jest.fn() }))
jest.mock('../store/appContext.js', () => ({ useApp: jest.fn() }))
jest.mock('../store/mapContext.js', () => ({ useMap: jest.fn() }))
jest.mock('../store/serviceContext.js', () => ({ useService: jest.fn() }))
jest.mock('../registry/iconRegistry.js', () => ({ getIconRegistry: jest.fn() }))

describe('useEvaluateProp hook', () => {
  const pluginDispatch = jest.fn()
  const mockPluginRegistry = {
    registeredPlugins: [],
    registerPlugin: jest.fn(),
    clear: jest.fn()
  }

  const pluginContextValue = {
    state: { myPlugin: { foo: 'bar' } },
    dispatch: pluginDispatch
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockPluginRegistry.registeredPlugins = []
    configStore.useConfig.mockReturnValue({
      mapProvider: { name: 'leaflet' },
      pluginRegistry: mockPluginRegistry
    })
    appStore.useApp.mockReturnValue({ user: 'alice' })
    mapStore.useMap.mockReturnValue({ zoom: 5 })
    serviceStore.useService.mockReturnValue({ reverseGeocode: jest.fn() })
    iconRegistryModule.getIconRegistry.mockReturnValue({ close: '<svg/>' })
  })

  it('returns the raw prop if it is not a function', () => {
    const { result } = renderHook(() => useEvaluateProp())
    const evaluate = result.current
    const value = evaluate(42)
    expect(value).toBe(42)
  })

  it('calls prop function with full context when no pluginId provided', () => {
    const { result } = renderHook(() => useEvaluateProp())
    const evaluate = result.current

    const fn = jest.fn(ctx => ctx.appState.user)

    // Because no pluginId is passed, the function is NOT auto-called anymore
    const value = evaluate(fn)

    // We now expect it NOT to have been called
    expect(fn).not.toHaveBeenCalled()

    // And the raw function should be returned
    expect(value).toBe(fn)

    // If we manually call it, it should still work with the correct context:
    const manualResult = value(evaluate.ctx)
    expect(manualResult).toBe('alice')

    expect(fn.mock.calls[0][0]).toMatchObject({
      appConfig: { mapProvider: { name: 'leaflet' } },
      appState: { user: 'alice' },
      mapState: { zoom: 5 },
      services: { reverseGeocode: expect.any(Function) },
      mapProvider: { name: 'leaflet' },
      iconRegistry: { close: '<svg/>' }
    })
  })

  it('includes pluginConfig and pluginState when pluginId provided', () => {
    mockPluginRegistry.registeredPlugins.push({ id: 'myPlugin', config: { includeModes: ['edit'], excludeModes: ['view'] } })

    const wrapper = ({ children }) => (
      <PluginContext.Provider value={pluginContextValue}>
        {children}
      </PluginContext.Provider>
    )

    const { result } = renderHook(() => useEvaluateProp(), { wrapper })
    const evaluate = result.current

    const fn = jest.fn(ctx => ctx.pluginState.foo)
    const value = evaluate(fn, 'myPlugin')

    expect(fn).toHaveBeenCalled()
    expect(value).toBe('bar')
    const ctxPassed = fn.mock.calls[0][0]
    expect(ctxPassed.pluginConfig).toEqual({
      pluginId: 'myPlugin',
      includeModes: ['edit'],
      excludeModes: ['view']
    })
    expect(ctxPassed.pluginState).toMatchObject({ foo: 'bar', dispatch: pluginDispatch })
  })

  it('returns empty pluginConfig if plugin not registered', () => {
    const wrapper = ({ children }) => (
      <PluginContext.Provider value={pluginContextValue}>
        {children}
      </PluginContext.Provider>
    )
    const { result } = renderHook(() => useEvaluateProp(), { wrapper })
    const evaluate = result.current

    const fn = jest.fn(ctx => ctx.pluginConfig)
    const value = evaluate(fn, 'unknownPlugin')
    expect(value).toEqual({})
  })

  it('exposes ctx property on the returned evaluateProp function', () => {
    const { result } = renderHook(() => useEvaluateProp())
    const evaluate = result.current
    expect(evaluate.ctx).toMatchObject({
      appConfig: { mapProvider: { name: 'leaflet' } },
      appState: { user: 'alice' },
      mapState: { zoom: 5 },
      services: { reverseGeocode: expect.any(Function) },
      mapProvider: { name: 'leaflet' },
      iconRegistry: { close: '<svg/>' }
    })
  })
})
