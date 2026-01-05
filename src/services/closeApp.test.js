import { closeApp } from './closeApp'

describe('closeApp', () => {
  let handleExitClickMock

  beforeEach(() => {
    handleExitClickMock = jest.fn()
    jest.spyOn(history, 'back').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('calls history.back() when history.state.isBack is true', () => {
    Object.defineProperty(history, 'state', {
      value: { isBack: true },
      writable: true,
      configurable: true
    })

    closeApp(handleExitClickMock)

    expect(history.back).toHaveBeenCalled()
    expect(handleExitClickMock).not.toHaveBeenCalled()
  })

  it('calls handleExitClick when history.state.isBack is not true', () => {
    Object.defineProperty(history, 'state', {
      value: null,
      writable: true,
      configurable: true
    })

    closeApp(handleExitClickMock)

    expect(history.back).not.toHaveBeenCalled()
    expect(handleExitClickMock).toHaveBeenCalled()
  })
})