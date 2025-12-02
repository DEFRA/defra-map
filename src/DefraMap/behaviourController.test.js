import { setupBehavior, shouldLoadComponent } from './behaviourController.js'
import * as detectBreakpoint from '../utils/detectBreakpoint.js'
import * as queryString from '../utils/queryString.js'

jest.mock('../utils/detectBreakpoint.js')
jest.mock('../utils/queryString.js')

describe('shouldLoadComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    detectBreakpoint.getBreakpoint.mockReturnValue('desktop')
    queryString.getQueryParam.mockReturnValue(null)
  })

  it.each([
    ['mapOnly', 'desktop', true],
    ['inline', 'desktop', true],
    ['hybrid', 'desktop', true],
    ['hybrid', 'mobile', false],
    ['buttonFirst', 'desktop', false]
  ])('returns %s for %s behaviour on %s', (behaviour, breakpoint, expected) => {
    detectBreakpoint.getBreakpoint.mockReturnValue(breakpoint)
    expect(shouldLoadComponent({ id: 'test', behaviour })).toBe(expected)
  })

  it('returns true when view param matches id', () => {
    queryString.getQueryParam.mockReturnValue('test')
    expect(shouldLoadComponent({ id: 'test', behaviour: 'buttonFirst' })).toBe(true)
  })
})

describe('setupBehavior', () => {
  let mockMapInstance, breakpointCallback

  beforeEach(() => {
    jest.clearAllMocks()
    mockMapInstance = {
      config: {},
      loadApp: jest.fn(),
      removeApp: jest.fn()
    }
    detectBreakpoint.subscribeToBreakpointChange.mockImplementation(cb => { breakpointCallback = cb })
  })

  it.each(['buttonFirst', 'hybrid'])('subscribes for %s behaviour', (behaviour) => {
    mockMapInstance.config = { behaviour }
    setupBehavior(mockMapInstance)
    expect(detectBreakpoint.subscribeToBreakpointChange).toHaveBeenCalled()
  })

  it('does not subscribe for mapOnly', () => {
    mockMapInstance.config = { behaviour: 'mapOnly' }
    setupBehavior(mockMapInstance)
    expect(detectBreakpoint.subscribeToBreakpointChange).not.toHaveBeenCalled()
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
