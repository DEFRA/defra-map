/**
 * @jest-environment jsdom
 */

import { debounce } from './debounce'

// Enable fake timers to control execution time
jest.useFakeTimers()

describe('debounce', () => {
  let mockFn
  let debouncedFn
  const WAIT_TIME = 500

  beforeEach(() => {
    mockFn = jest.fn()
    debouncedFn = debounce(mockFn, WAIT_TIME)
    jest.clearAllMocks()
  })

  // Test 1: Immediate execution and core debouncing (multiple calls)
  it('should only call the function once after multiple rapid calls, using the last arguments', () => {
    // Immediate call check
    debouncedFn('initial')
    expect(mockFn).not.toHaveBeenCalled()

    // Rapid subsequent calls
    debouncedFn('first')
    jest.advanceTimersByTime(WAIT_TIME / 2)
    debouncedFn('last', 42) // This resets the timer

    // Check timing before final call
    jest.advanceTimersByTime(WAIT_TIME - 1)
    expect(mockFn).not.toHaveBeenCalled()

    // Final call after wait time
    jest.advanceTimersByTime(1)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('last', 42)
  })

  // Test 2: Function runs again successfully after the first execution finishes
  it('should run subsequent executions independently', () => {
    // First run
    debouncedFn(1)
    jest.advanceTimersByTime(WAIT_TIME)
    expect(mockFn).toHaveBeenCalledTimes(1)

    // Second run
    debouncedFn(2)
    jest.advanceTimersByTime(WAIT_TIME)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenCalledWith(2)
  })

  // Test 3: The cancel method logic
  it('should cancel pending execution and allow safe subsequent cancellation', () => {
    // Check cancellation path
    debouncedFn()
    debouncedFn.cancel()
    jest.advanceTimersByTime(WAIT_TIME)
    expect(mockFn).not.toHaveBeenCalled()

    // Check safety of calling cancel when no timer is active
    // This covers the `if (timeoutId)` check inside `cancel`
    expect(() => debouncedFn.cancel()).not.toThrow()

    // Check function execution can restart after cancellation
    debouncedFn()
    jest.advanceTimersByTime(WAIT_TIME)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
