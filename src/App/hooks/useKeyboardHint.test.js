import { renderHook, act } from '@testing-library/react'
import { useKeyboardHint } from './useKeyboardHint'

const createRefs = () => ({
  containerRef: { current: document.createElement('div') },
  keyboardHintRef: { current: document.createElement('div') }
})

const defaultProps = (overrides = {}) => ({
  interfaceType: 'keyboard',
  keyboardHintVisible: true,
  onViewportFocusChange: jest.fn(),
  ...createRefs(),
  ...overrides
})

describe('useKeyboardHint', () => {
  test('returns handlers and showHint', () => {
    const { result } = renderHook(() => useKeyboardHint(defaultProps()))

    expect(result.current.showHint).toBe(true)
    expect(typeof result.current.handleFocus).toBe('function')
    expect(typeof result.current.handleBlur).toBe('function')
  })

  test('useEffect early-returns when showHint = false', () => {
    const props = defaultProps({ keyboardHintVisible: false })
    const spy = jest.spyOn(props.containerRef.current, 'addEventListener')

    renderHook(() => useKeyboardHint(props))

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  test('keydown Escape and Tab trigger onViewportFocusChange(false)', () => {
    const props = defaultProps()

    renderHook(() => useKeyboardHint(props))

    const keys = ['Escape', 'Tab']
    keys.forEach(key => {
      act(() => {
        props.containerRef.current.dispatchEvent(
          new KeyboardEvent('keydown', { key })
        )
      })
    })

    expect(props.onViewportFocusChange).toHaveBeenCalledTimes(2)
    expect(props.onViewportFocusChange).toHaveBeenCalledWith(false)
  })

  test('keydown with other keys does NOT trigger onViewportFocusChange', () => {
    const props = defaultProps()

    renderHook(() => useKeyboardHint(props))

    const keys = ['Enter', 'a']
    keys.forEach(key => {
      act(() => {
        props.containerRef.current.dispatchEvent(
          new KeyboardEvent('keydown', { key })
        )
      })
    })

    expect(props.onViewportFocusChange).not.toHaveBeenCalled()
  })

  test('mousedown inside container but outside hint triggers false', () => {
    const props = defaultProps()
    const child = document.createElement('div')
    props.containerRef.current.appendChild(child)

    renderHook(() => useKeyboardHint(props))

    act(() => {
      child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })

    expect(props.onViewportFocusChange).toHaveBeenCalledWith(false)
  })

  test('mousedown inside keyboardHintRef does NOT trigger change', () => {
    const props = defaultProps()
    props.containerRef.current.appendChild(props.keyboardHintRef.current)

    renderHook(() => useKeyboardHint(props))

    act(() => {
      props.keyboardHintRef.current.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      )
    })

    expect(props.onViewportFocusChange).not.toHaveBeenCalled()
  })

  test('cleanup removes event listeners', () => {
    const props = defaultProps()
    const spy = jest.spyOn(props.containerRef.current, 'removeEventListener')

    const { unmount } = renderHook(() => useKeyboardHint(props))

    unmount()
    expect(spy).toHaveBeenCalled()
  })

  test('handleFocus triggers true only for keyboard interface', () => {
    const props = defaultProps()
    const { result } = renderHook(() => useKeyboardHint(props))

    act(() => result.current.handleFocus())

    expect(props.onViewportFocusChange).toHaveBeenCalledWith(true)
  })

  test('handleFocus does not trigger if interfaceType is not keyboard', () => {
    const props = defaultProps({ interfaceType: 'mouse' })
    const { result } = renderHook(() => useKeyboardHint(props))

    act(() => result.current.handleFocus())

    expect(props.onViewportFocusChange).not.toHaveBeenCalled()
  })

  test('handleBlur always triggers false', () => {
    const props = defaultProps({ interfaceType: 'mouse' })
    const { result } = renderHook(() => useKeyboardHint(props))

    act(() => result.current.handleBlur())

    expect(props.onViewportFocusChange).toHaveBeenCalledWith(false)
  })
})
