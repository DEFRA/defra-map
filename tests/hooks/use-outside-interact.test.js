import { renderHook } from '@testing-library/react'
import { useOutsideInteract } from '../../src/js/hooks/use-outside-interact'

describe('useOutsideInteract', () => {
  let mockCallback
  let addEventListenerSpy
  let removeEventListenerSpy

  beforeEach(() => {
    mockCallback = jest.fn()
    // Spy on document event listeners
    addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should add event listener on mount', () => {
    const ref = { current: document.createElement('div') }
    renderHook(() => useOutsideInteract(ref, false, 'click', mockCallback))

    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('should remove event listener on unmount', () => {
    const ref = { current: document.createElement('div') }
    const { unmount } = renderHook(() => useOutsideInteract(ref, false, 'click', mockCallback))

    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  it('should call callback when clicking outside the ref element', () => {
    const ref = { current: document.createElement('div') }
    renderHook(() => useOutsideInteract(ref, false, 'click', mockCallback))

    // Simulate click outside
    const clickEvent = new Event('click')
    document.dispatchEvent(clickEvent)

    expect(mockCallback).toHaveBeenCalledWith(clickEvent)
  })

  it('should not call callback when clicking inside the ref element', () => {
    const ref = { current: document.createElement('div') }
    renderHook(() => useOutsideInteract(ref, false, 'click', mockCallback))

    // Simulate click inside
    const clickEvent = new Event('click')
    ref.current.dispatchEvent(clickEvent)

    expect(mockCallback).not.toHaveBeenCalled()
  })

  it('should not call callback when ref is null', () => {
    const ref = { current: null }
    renderHook(() => useOutsideInteract(ref, false, 'click', mockCallback))

    // Simulate click
    const clickEvent = new Event('click')
    document.dispatchEvent(clickEvent)

    expect(mockCallback).not.toHaveBeenCalled()
  })

  it('should use different event type when specified', () => {
    const ref = { current: document.createElement('div') }
    renderHook(() => useOutsideInteract(ref, false, 'mousedown', mockCallback))

    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
  })

  it('should handle cleanup when component unmounts', () => {
    const ref = { current: document.createElement('div') }
    const { unmount } = renderHook(() => useOutsideInteract(ref, false, 'click', mockCallback))

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalled()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })
})