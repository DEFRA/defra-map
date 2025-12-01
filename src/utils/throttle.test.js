import { throttle } from './throttle'

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(history, 'replaceState').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('calls the function immediately on first call', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('does not call the function again before wait time', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 100)
    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls the function again after wait time has passed', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 100)

    throttled() // call at t=0
    jest.advanceTimersByTime(50)
    throttled() // ignored
    jest.advanceTimersByTime(50)
    throttled() // should run
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('passes arguments correctly', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 100)
    throttled(1, 2, 3)
    expect(fn).toHaveBeenCalledWith(1, 2, 3)
  })

  it('works with multiple rapid calls over time', () => {
    const fn = jest.fn()
    const throttled = throttle(fn, 100)

    throttled() // t=0
    jest.advanceTimersByTime(30)
    throttled() // ignored
    jest.advanceTimersByTime(70)
    throttled() // t=100, should call
    jest.advanceTimersByTime(100)
    throttled() // t=200, should call
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
