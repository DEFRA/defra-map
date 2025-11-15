import { renderHook } from '@testing-library/react'
import { useButtonStateEvaluator } from './useButtonStateEvaluator'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { registeredPlugins } from '../registry/pluginRegistry.js'
import { useContext } from 'react'

jest.mock('../store/appContext.js')
jest.mock('../store/mapContext.js')
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}))
jest.mock('../registry/pluginRegistry.js', () => ({ registeredPlugins: [] }))

describe('useButtonStateEvaluator', () => {
  let mockAppState, mockDispatch

  beforeEach(() => {
    mockDispatch = jest.fn()
    mockAppState = {
      disabledButtons: new Set(),
      hiddenButtons: new Set(),
      pressedButtons: new Set(),
      dispatch: mockDispatch
    }

    useApp.mockReturnValue(mockAppState)
    useMap.mockReturnValue({ zoom: 10 })
    useContext.mockReturnValue({ state: {} })

    registeredPlugins.length = 0
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => console.warn.mockRestore())

  it('returns early when required state missing', () => {
    useApp.mockReturnValue(null)
    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).not.toHaveBeenCalled()

    useApp.mockReturnValue({})
    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).not.toHaveBeenCalled()

    useApp.mockReturnValue(mockAppState)
    useMap.mockReturnValue(null)
    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).not.toHaveBeenCalled()

    useMap.mockReturnValue({ zoom: 10 })
    useContext.mockReturnValue(null)
    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('handles missing manifest or buttons', () => {
    registeredPlugins.push({ id: 'p1' }, { id: 'p2', manifest: {} })
    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('toggles button disabled state', () => {
    registeredPlugins.push({
      id: 'p1',
      manifest: { buttons: [{ id: 'btn1', enableWhen: () => false }] }
    })

    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_BUTTON_DISABLED',
      payload: { id: 'btn1', isDisabled: true }
    })

    mockDispatch.mockClear()
    mockAppState.disabledButtons.add('btn1')
    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('toggles button hidden state', () => {
    registeredPlugins.push({
      id: 'p1',
      manifest: { buttons: [{ id: 'btn1', hiddenWhen: () => true }] }
    })

    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_BUTTON_HIDDEN',
      payload: { id: 'btn1', isHidden: true }
    })
  })

  it('toggles button pressed state', () => {
    registeredPlugins.push({
      id: 'p1',
      manifest: { buttons: [{ id: 'btn1', pressedWhen: () => true }] }
    })

    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_BUTTON_PRESSED',
      payload: { id: 'btn1', isPressed: true }
    })
  })

  it('does not dispatch when hidden state unchanged', () => {
    mockAppState.hiddenButtons.add('btn1')
    registeredPlugins.push({
      id: 'p1',
      manifest: { buttons: [{ id: 'btn1', hiddenWhen: () => true }] }
    })

    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('does not dispatch when pressed state unchanged', () => {
    mockAppState.pressedButtons.add('btn1')
    registeredPlugins.push({
      id: 'p1',
      manifest: { buttons: [{ id: 'btn1', pressedWhen: () => true }] }
    })

    renderHook(() => useButtonStateEvaluator())
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('passes combined state with plugin state', () => {
    const enableWhen = jest.fn(() => true)
    useContext.mockReturnValue({ state: { p1: { data: 'test' } } })

    registeredPlugins.push({
      id: 'p1',
      manifest: { buttons: [{ id: 'btn1', enableWhen }] }
    })
    renderHook(() => useButtonStateEvaluator())

    expect(enableWhen).toHaveBeenCalledWith({
      appState: mockAppState,
      mapState: { zoom: 10 },
      pluginState: { data: 'test' }
    })
  })

  it('handles errors in evaluators', () => {
    registeredPlugins.push({
      id: 'p1',
      manifest: {
        buttons: [
          { id: 'btn1', enableWhen: () => { throw new Error('e1') } },
          { id: 'btn2', hiddenWhen: () => { throw new Error('e2') } },
          { id: 'btn3', pressedWhen: () => { throw new Error('e3') } }
        ]
      }
    })

    renderHook(() => useButtonStateEvaluator())

    expect(console.warn).toHaveBeenCalledTimes(3)
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})