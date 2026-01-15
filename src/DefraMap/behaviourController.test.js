import { setupBehavior, shouldLoadComponent } from './behaviourController.js'
import * as queryString from '../utils/queryString.js'

jest.mock('../utils/queryString.js')

describe('shouldLoadComponent', () => {
  let mockBreakpointDetector

  beforeEach(() => {
    jest.clearAllMocks()
    mockBreakpointDetector = {
      getBreakpoint: jest.fn(() => 'desktop'),
      subscribe: jest.fn(),
      destroy: jest.fn()
    }
    queryString.getQueryParam.mockReturnValue(null)
  })

  it.each([
    ['mapOnly', 'desktop', true],
    ['inline', 'desktop', true],
    ['hybrid', 'desktop', true],
    ['hybrid', 'mobile', false],
    ['buttonFirst', 'desktop', false]
  ])('returns %s for %s behaviour on %s', (behaviour, breakpoint, expected) => {
    mockBreakpointDetector.getBreakpoint.mockReturnValue(breakpoint)
    expect(shouldLoadComponent({ id: 'test', behaviour }, mockBreakpointDetector)).toBe(expected)
  })

  it('returns true when view param matches id', () => {
    queryString.getQueryParam.mockReturnValue('test')
    expect(shouldLoadComponent({ id: 'test', behaviour: 'buttonFirst' }, mockBreakpointDetector)).toBe(true)
  })
})

describe('setupBehavior', () => {
  let mockMapInstance, mockBreakpointDetector, breakpointCallback

  beforeEach(() => {
    jest.clearAllMocks()
    mockBreakpointDetector = {
      getBreakpoint: jest.fn(() => 'desktop'),
      subscribe: jest.fn(cb => { breakpointCallback = cb }),
      destroy: jest.fn()
    }
    mockMapInstance = {
      config: {},
      _breakpointDetector: mockBreakpointDetector,
      loadApp: jest.fn(),
      removeApp: jest.fn()
    }
  })

  it.each(['buttonFirst', 'hybrid'])('subscribes for %s behaviour', (behaviour) => {
    mockMapInstance.config = { behaviour }
    setupBehavior(mockMapInstance)
    expect(mockBreakpointDetector.subscribe).toHaveBeenCalled()
  })

  it('does not subscribe for mapOnly', () => {
    mockMapInstance.config = { behaviour: 'mapOnly' }
    setupBehavior(mockMapInstance)
    expect(mockBreakpointDetector.subscribe).not.toHaveBeenCalled()
  })

  it('loads/removes component based on shouldLoadComponent', () => {
    mockMapInstance.config = { id: 'test', behaviour: 'buttonFirst' }
    setupBehavior(mockMapInstance)

    queryString.getQueryParam.mockReturnValue('test')
    breakpointCallback()
    expect(mockMapInstance.loadApp).toHaveBeenCalled()

    queryString.getQueryParam.mockReturnValue(null)
    breakpointCallback()
    expect(mockMapInstance.removeApp).toHaveBeenCalled()
  })
})
