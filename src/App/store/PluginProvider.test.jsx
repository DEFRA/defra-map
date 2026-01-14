import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { PluginProvider, usePlugin, PluginContext, makeReducer } from './PluginProvider.jsx'
import { registeredPlugins } from '../registry/pluginRegistry.js'
import { useConfig } from './configContext.js'

jest.mock('../registry/pluginRegistry.js', () => ({ registeredPlugins: [] }))
jest.mock('./configContext.js')

const wrapper = ({ children }) => <PluginProvider>{children}</PluginProvider>

describe('makeReducer', () => {
  const actions = { SET: (s, p) => ({ ...s, val: p }) }
  const reducer = makeReducer(actions)

  test('handles default state, actions, and edge cases', () => {
    expect(reducer()).toEqual({})
    expect(reducer(undefined, { type: 'SET', payload: 'new' })).toEqual({ val: 'new' })
    expect(reducer({ val: 'old' }, { type: 'UNKNOWN' })).toEqual({ val: 'old' })
    expect(makeReducer(null)({ x: 1 }, { type: 'ANY' })).toEqual({ x: 1 })
  })
})

describe('PluginProvider', () => {
  beforeEach(() => {
    registeredPlugins.length = 0
    useConfig.mockReturnValue({ pluginRegistry: { registeredPlugins: [] } })
  })

  test('renders without error', () => {
    const { result } = renderHook(() => true, { wrapper })
    expect(result.error).toBeUndefined()
  })
})

describe('usePlugin', () => {
  beforeEach(() => {
    registeredPlugins.length = 0
    useConfig.mockReturnValue({ pluginRegistry: { registeredPlugins } })
  })

  test('throws error outside provider', () => {
    expect(() => renderHook(() => usePlugin('any'))).toThrow('usePlugin must be used within PluginProvider')
  })

  test('handles plugin without reducer', () => {
    registeredPlugins.push({ id: 'noReducer', manifest: {} })
    const { result } = renderHook(() => usePlugin('noReducer'), { wrapper })

    expect(result.current.dispatch).toEqual(expect.any(Function))
    expect(result.current.refs).toEqual({})

    const ref1 = result.current.useRef('key')
    const ref2 = result.current.useRef('key')
    expect(ref1).toBe(ref2)
    expect(result.current.refs.key).toBe(ref1)

    act(() => result.current.dispatch({ type: 'ANY' }))
  })

  test('handles plugin with reducer', () => {
    registeredPlugins.push({
      id: 'counter',
      reducer: {
        initialState: { count: 0 },
        actions: { INC: (s) => ({ count: s.count + 1 }) }
      }
    })

    const { result } = renderHook(() => usePlugin('counter'), { wrapper })

    expect(result.current.count).toBe(0)
    act(() => result.current.dispatch({ type: 'INC' }))
    expect(result.current.count).toBe(1)
    act(() => result.current.dispatch({ type: 'UNKNOWN' }))
    expect(result.current.count).toBe(1)
  })

  test('initializes missing refs in getPluginRef', () => {
    registeredPlugins.push({ id: 'test', manifest: {} })
    const { result } = renderHook(() => React.useContext(PluginContext), { wrapper })

    delete result.current.refs.current.test
    const ref = result.current.getPluginRef('test', 'key')

    expect(result.current.refs.current.test.key).toBe(ref)
  })

  test('initializes refs for unregistered plugin', () => {
    const { result } = renderHook(() => usePlugin('unregistered'), { wrapper })

    expect(result.current.refs).toEqual({})
    expect(result.current.dispatch).toEqual(expect.any(Function))
  })
})
