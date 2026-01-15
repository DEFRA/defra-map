import { renderHook, act } from '@testing-library/react'
import { useIsScrollable } from './useIsScrollable.js'
import { useResizeObserver } from './useResizeObserver.js'

jest.mock('./useResizeObserver.js', () => ({ useResizeObserver: jest.fn() }))

describe('useIsScrollable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns false initially', () => {
    const ref = { current: null }
    const { result } = renderHook(() => useIsScrollable(ref))
    expect(result.current).toBe(false)
  })

  it('returns true when scrollHeight > clientHeight', () => {
    const ref = { current: { scrollHeight: 500, clientHeight: 300 } }
    let capturedCallback

    useResizeObserver.mockImplementation((_targetRef, callback) => {
      capturedCallback = callback
    })

    const { result } = renderHook(() => useIsScrollable(ref))

    act(() => {
      capturedCallback()
    })

    expect(result.current).toBe(true)
  })

  it('returns false when scrollHeight <= clientHeight', () => {
    const ref = { current: { scrollHeight: 200, clientHeight: 300 } }
    let capturedCallback

    useResizeObserver.mockImplementation((_targetRef, callback) => {
      capturedCallback = callback
    })

    const { result } = renderHook(() => useIsScrollable(ref))

    act(() => {
      capturedCallback()
    })

    expect(result.current).toBe(false)
  })

  it('handles null ref gracefully', () => {
    const ref = { current: null }
    let capturedCallback

    useResizeObserver.mockImplementation((_targetRef, callback) => {
      capturedCallback = callback
    })

    const { result } = renderHook(() => useIsScrollable(ref))

    act(() => {
      capturedCallback()
    })

    expect(result.current).toBe(false)
  })

  it('passes targetRef to useResizeObserver', () => {
    const ref = { current: document.createElement('div') }
    renderHook(() => useIsScrollable(ref))

    expect(useResizeObserver).toHaveBeenCalledWith(ref, expect.any(Function))
  })
})
