import { renderHook } from '@testing-library/react'
import { useResizeObserver } from '../../src/js/hooks/use-resize-observer'

describe('useResizeObserver', () => {
  let observers = []
  let mockElement
  let mockCallback

  beforeEach(() => {
    // Mock ResizeObserver
    window.ResizeObserver = jest.fn((callback) => ({
      observe: jest.fn((element) => {
        observers.push({ element, callback })
      }),
      unobserve: jest.fn((element) => {
        observers = observers.filter(obs => obs.element !== element)
      })
    }))

    // Create mock element and callback
    mockElement = document.createElement('div')
    mockCallback = jest.fn()
  })

  afterEach(() => {
    observers = []
    jest.clearAllMocks()
  })

  it('should observe the element when mounted', () => {
    renderHook(() => useResizeObserver(mockElement, mockCallback))

    expect(observers.length).toBe(1)
    expect(observers[0].element).toBe(mockElement)
  })

  it('should call callback when dimensions change', () => {
    renderHook(() => useResizeObserver(mockElement, mockCallback))

    // Simulate resize event
    const entry = {
      contentRect: {
        width: 100,
        height: 100
      }
    }

    observers[0].callback([entry])

    expect(mockCallback).toHaveBeenCalled()
  })

  it('should not call callback if dimensions have not changed', () => {
    renderHook(() => useResizeObserver(mockElement, mockCallback))

    // Simulate resize event with same dimensions
    const entry = {
      contentRect: {
        width: 100,
        height: 100
      }
    }

    observers[0].callback([entry])
    observers[0].callback([entry]) // Second call with same dimensions

    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should unobserve when unmounting', () => {
    const { unmount } = renderHook(() => useResizeObserver(mockElement, mockCallback))

    expect(observers.length).toBe(1)

    unmount()

    expect(observers.length).toBe(0)
  })

  it('should handle case when ResizeObserver is not available', () => {
    window.ResizeObserver = undefined

    renderHook(() => useResizeObserver(mockElement, mockCallback))

    // Should not throw and callback should not be called
    expect(mockCallback).not.toHaveBeenCalled()
  })

  it('should handle null element', () => {
    renderHook(() => useResizeObserver(null, mockCallback))

    // Should not throw and no observers should be created
    expect(observers.length).toBe(0)
  })

  it('should reobserve when element changes', () => {
    const { rerender } = renderHook(
      ({ element }) => useResizeObserver(element, mockCallback),
      { initialProps: { element: mockElement } }
    )

    const newElement = document.createElement('div')
    rerender({ element: newElement })

    expect(observers.length).toBe(1)
    expect(observers[0].element).toBe(newElement)
  })
})
