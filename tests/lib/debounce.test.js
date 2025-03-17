import { debounce } from '../../src/js/lib/debounce'

jest.useFakeTimers()

describe('debounce', () => {
  it('should call the function after the specified delay', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn()
    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1000)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should call the function with the correct arguments', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 500)

    debouncedFn('arg1', 'arg2')
    jest.advanceTimersByTime(500)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should reset the timeout if called again within the delay', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn()
    jest.advanceTimersByTime(500)

    debouncedFn()
    jest.advanceTimersByTime(500)

    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(500)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
