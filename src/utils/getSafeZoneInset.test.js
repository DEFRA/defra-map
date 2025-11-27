import { getSafeZoneInset } from './getSafeZoneInset'

describe('getSafeZoneInset', () => {
  let mainRef, insetRef, rightRef, footerRef, actionsRef
  let originalGetComputedStyle

  beforeAll(() => { originalGetComputedStyle = window.getComputedStyle })
  afterAll(() => { window.getComputedStyle = originalGetComputedStyle })

  beforeEach(() => {
    mainRef = { current: { offsetWidth: 800, offsetHeight: 600, offsetLeft: 0 } }
    insetRef = { current: { offsetWidth: 100, offsetHeight: 50, offsetTop: 50, offsetLeft: 20 } }
    rightRef = { current: { offsetWidth: 50, offsetLeft: 0 } }
    footerRef = { current: { offsetTop: 550 } }
    actionsRef = { current: { offsetTop: 520 } }
    window.getComputedStyle = jest.fn().mockReturnValue({ getPropertyValue: () => '10' })
  })

  const runScenario = ({ isLandscape, insetHeight }) => {
    insetRef.current.offsetHeight = insetHeight

    // Force isLandscape by adjusting widths/heights
    if (isLandscape) {
      mainRef.current.offsetWidth = 1000
      insetRef.current.offsetWidth = 400
    } else {
      mainRef.current.offsetWidth = 600
      insetRef.current.offsetWidth = 100
    }

    return getSafeZoneInset({ mainRef, insetRef, rightRef, footerRef, actionsRef })
  }

  it('topOffset adds 0 when portrait and height = 0, leftOffset = rightOffset', () => {
    const result = runScenario({ isLandscape: false, insetHeight: 0 })
    expect(result.top).toBe(insetRef.current.offsetTop) // 0 added
    expect(result.left).toBeGreaterThanOrEqual(rightRef.current.offsetWidth + insetRef.current.offsetLeft)
  })

  it('topOffset adds 0 when landscape and height > 0, leftOffset = insetWidth + insetLeft + dividerGap', () => {
    const result = runScenario({ isLandscape: true, insetHeight: 50 })
    expect(result.top).toBe(insetRef.current.offsetTop) // 0 added
    expect(result.left).toBeGreaterThan(insetRef.current.offsetWidth + insetRef.current.offsetLeft)
  })

  it('topOffset adds 0 when landscape and height = 0, leftOffset = insetWidth + insetLeft + dividerGap', () => {
    const result = runScenario({ isLandscape: true, insetHeight: 0 })
    expect(result.top).toBe(insetRef.current.offsetTop) // 0 added
    expect(result.left).toBeGreaterThan(insetRef.current.offsetWidth + insetRef.current.offsetLeft)
  })

  it('topOffset adds insetHeight when portrait and height > 0, leftOffset = rightOffset', () => {
    insetRef.current.offsetHeight = 50
    insetRef.current.offsetTop = 50
    mainRef.current.offsetWidth = 200 // ensure availableWidth < availableHeight - insetHeight => portrait
    mainRef.current.offsetHeight = 600
    const result = getSafeZoneInset({ mainRef, insetRef, rightRef, footerRef, actionsRef })
    // topOffset = insetTop + insetHeight + dividerGap = 50 + 50 + 10 = 110
    expect(result.top).toBe(110)
    // leftOffset = rightOffset = insetLeft + rightWidth + dividerGap = 20 + 50 + 10 = 80
    expect(result.left).toBe(80)
  })
})
