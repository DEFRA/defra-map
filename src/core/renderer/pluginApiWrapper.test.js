import React from 'react'
import { renderHook } from '@testing-library/react'
import { withPluginApiContexts, usePluginApiState } from './pluginApiWrapper.js'
import { useConfig } from '../store/configContext.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { useService } from '../store/serviceContext.js'
import { usePlugin } from '../store/PluginProvider.jsx'

jest.mock('../store/configContext.js', () => ({ useConfig: jest.fn() }))
jest.mock('../store/appContext.js', () => ({ useApp: jest.fn() }))
jest.mock('../store/mapContext.js', () => ({ useMap: jest.fn() }))
jest.mock('../store/serviceContext.js', () => ({ useService: jest.fn() }))
jest.mock('../store/PluginProvider.jsx', () => ({ usePlugin: jest.fn() }))

describe('pluginApiWrapper', () => {
  describe('withPluginApiContexts', () => {
    test('calls original function with state and additional args', () => {
      const fn = jest.fn((state, arg1, arg2) => `${state.pluginId}-${arg1}-${arg2}`)
      const stateRef = { current: { appState: 'app', mapState: 'map' } }
      const wrapped = withPluginApiContexts(fn, { 
        pluginId: 'test-plugin', 
        pluginConfig: { foo: 'bar' }, 
        stateRef 
      })

      const result = wrapped('hello', 'world')

      expect(fn).toHaveBeenCalledWith(
        { appState: 'app', mapState: 'map', pluginConfig: { foo: 'bar' }, pluginId: 'test-plugin' },
        'hello',
        'world'
      )
      expect(result).toBe('test-plugin-hello-world')
    })

    test('throws error when state is not initialized', () => {
      const fn = jest.fn()
      const stateRef = { current: null }
      const wrapped = withPluginApiContexts(fn, { pluginId: 'test-plugin', pluginConfig: {}, stateRef })

      expect(() => wrapped()).toThrow('Plugin API "test-plugin" called before state is initialized')
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('usePluginApiState', () => {
    const mockContexts = {
      appConfig: { config: 'value' },
      appState: { state: 'value' },
      mapState: { map: 'value' },
      services: { service: 'value' },
      pluginState: { plugin: 'value' }
    }

    beforeEach(() => {
      useConfig.mockReturnValue(mockContexts.appConfig)
      useApp.mockReturnValue(mockContexts.appState)
      useMap.mockReturnValue(mockContexts.mapState)
      useService.mockReturnValue(mockContexts.services)
      usePlugin.mockReturnValue(mockContexts.pluginState)
    })

    test('returns ref with all context values', () => {
      const { result } = renderHook(() => usePluginApiState('test-plugin'))

      expect(result.current.current).toEqual(mockContexts)
      expect(usePlugin).toHaveBeenCalledWith('test-plugin')
    })

    test('updates ref on re-render', () => {
      const { result, rerender } = renderHook(() => usePluginApiState('test-plugin'))

      expect(result.current.current).toEqual(mockContexts)

      useApp.mockReturnValue({ state: 'updated' })
      rerender()

      expect(result.current.current.appState).toEqual({ state: 'updated' })
    })
  })
})