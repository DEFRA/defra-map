import eventBus from '../services/eventBus.js'
import { closeApp } from './closeApp'

jest.mock('../services/eventBus.js', () => ({
  __esModule: true,
  default: { emit: jest.fn() }
}))

describe('closeApp', () => {
  let handleExitClickMock

  beforeEach(() => {
    handleExitClickMock = jest.fn()
    jest.spyOn(history, 'back').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('calls history.back() when history.state.isBack is true', () => {
    Object.defineProperty(history, 'state', {
      value: { isBack: true },
      writable: true,
      configurable: true
    })

    closeApp('map-123', handleExitClickMock)

    expect(eventBus.emit).toHaveBeenCalledWith('map:exit', { mapId: 'map-123' })
    expect(history.back).toHaveBeenCalled()
    expect(handleExitClickMock).not.toHaveBeenCalled()
  })

  it('calls handleExitClick when history.state.isBack is not true', () => {
    Object.defineProperty(history, 'state', {
      value: null,
      writable: true,
      configurable: true
    })

    closeApp('map-123', handleExitClickMock)

    expect(eventBus.emit).toHaveBeenCalledWith('map:exit', { mapId: 'map-123' })
    expect(history.back).not.toHaveBeenCalled()
    expect(handleExitClickMock).toHaveBeenCalled()
  })
})
