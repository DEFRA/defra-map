import React from 'react'
import { renderHook } from '@testing-library/react'
import { useLayoutMeasurements } from './useLayoutMeasurements'
import { useResizeObserver } from './useResizeObserver.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { getSafeZoneInset } from '../../utils/getSafeZoneInset.js'

jest.mock('./useResizeObserver.js')
jest.mock('../store/appContext.js')
jest.mock('../store/mapContext.js')
jest.mock('../../utils/getSafeZoneInset.js')

const createEl = (overrides = {}) => {
  if (overrides === null) return null
  const el = document.createElement('div')
  Object.defineProperty(el, 'offsetHeight', { value: overrides.offsetHeight?.value ?? 100, configurable: true })
  Object.defineProperty(el, 'offsetWidth', { value: overrides.offsetWidth?.value ?? 200, configurable: true })
  Object.defineProperty(el, 'offsetTop', { value: overrides.offsetTop?.value ?? 10, configurable: true })
  Object.defineProperty(el, 'offsetLeft', { value: overrides.offsetLeft?.value ?? 20, configurable: true })
  return el
}

const createRefs = (overrides = {}) => ({
  mainRef: { current: createEl(overrides.main) },
  bannerRef: { current: createEl(overrides.banner) },
  topRef: { current: createEl(overrides.top) },
  topLeftColRef: { current: createEl(overrides.topLeftCol) },
  topRightColRef: { current: createEl(overrides.topRightCol) },
  insetRef: { current: createEl(overrides.inset) },
  footerRef: { current: createEl(overrides.bottom) },
  actionsRef: { current: createEl(overrides.actions) }
})

const setup = (overrides = {}) => {
  const dispatch = jest.fn()
  const layoutRefs = createRefs(overrides.refs)
  useApp.mockReturnValue({ dispatch, breakpoint: 'md', layoutRefs, ...overrides.app })
  useMap.mockReturnValue({ mapSize: { width: 800, height: 600 }, isMapReady: true, ...overrides.map })
  getSafeZoneInset.mockReturnValue({ top: 0, right: 0, bottom: 0, left: 0 })
  return { dispatch, layoutRefs }
}

describe('useLayoutMeasurements', () => {
  let rafSpy, setPropertySpy

  beforeEach(() => {
    jest.clearAllMocks()
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb())
    setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty')
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({ getPropertyValue: () => '8' })
  })

  afterEach(() => {
    rafSpy.mockRestore()
    setPropertySpy.mockRestore()
    jest.restoreAllMocks()
  })

  test('early returns when required refs are null', () => {
    setup({ refs: { main: null } })
    renderHook(() => useLayoutMeasurements())
    expect(setPropertySpy).not.toHaveBeenCalled()
  })

  test('calculates all CSS custom properties', () => {
    setup()
    renderHook(() => useLayoutMeasurements())
    
    const cssVars = ['--inset-offset-top', '--inset-max-height', '--offset-left', '--right-offset-top', '--right-offset-bottom', '--top-col-width']
    cssVars.forEach(prop => {
      expect(setPropertySpy).toHaveBeenCalledWith(prop, expect.any(String))
    })
  })

  test('calculates inset properties correctly', () => {
    setup({ refs: { 
      main: { offsetHeight: { value: 500 } },
      topLeftCol: { offsetHeight: { value: 50 } },
      top: { offsetTop: { value: 20 } }
    }})
    renderHook(() => useLayoutMeasurements())
    expect(setPropertySpy).toHaveBeenCalledWith('--inset-offset-top', '70px')
    expect(setPropertySpy).toHaveBeenCalledWith('--inset-max-height', '410px')
  })

  test('calculates bottom offset left based on overlap', () => {
    const withOverlap = { refs: {
      inset: { offsetHeight: { value: 200 }, offsetLeft: { value: 30 }, offsetWidth: { value: 150 } },
      bottom: { offsetTop: { value: 100 } },
      actions: { offsetTop: { value: 120 } },
      topLeftCol: { offsetHeight: { value: 50 } },
      top: { offsetTop: { value: 10 } }
    }}
    setup(withOverlap)
    renderHook(() => useLayoutMeasurements())
    expect(setPropertySpy).toHaveBeenCalledWith('--offset-left', '180px')

    setPropertySpy.mockClear()
    setup({ refs: { inset: { offsetHeight: { value: 50 } }, bottom: { offsetTop: { value: 200 } },
      actions: { offsetTop: { value: 220 } }, topLeftCol: { offsetHeight: { value: 50 } },
      top: { offsetTop: { value: 10 } }}})
    renderHook(() => useLayoutMeasurements())
    expect(setPropertySpy).toHaveBeenCalledWith('--offset-left', '0px')
  })

  test('calculates right column offsets and uses Math.min for bottomOffsetTop', () => {
    setup({ refs: {
      topRightCol: { offsetHeight: { value: 80 } },
      top: { offsetTop: { value: 15 } },
      main: { offsetHeight: { value: 600 } },
      bottom: { offsetTop: { value: 500 } },
      actions: { offsetTop: { value: 150 } }
    }})
    renderHook(() => useLayoutMeasurements())
    expect(setPropertySpy).toHaveBeenCalledWith('--right-offset-top', '95px')
    expect(setPropertySpy).toHaveBeenCalledWith('--right-offset-bottom', '108px')
  })

  test('calculates top column width using max of left and right', () => {
    setup({ refs: { topLeftCol: { offsetWidth: { value: 250 } }, 
      topRightCol: { offsetWidth: { value: 200 } }}})
    renderHook(() => useLayoutMeasurements())
    expect(setPropertySpy).toHaveBeenCalledWith('--top-col-width', '250px')

    setPropertySpy.mockClear()
    setup({ refs: { topLeftCol: { offsetWidth: { value: 0 } }, 
      topRightCol: { offsetWidth: { value: 200 } }}})
    renderHook(() => useLayoutMeasurements())
    expect(setPropertySpy).toHaveBeenCalledWith('--top-col-width', '200px')

    setPropertySpy.mockClear()
    setup({ refs: { topLeftCol: { offsetWidth: { value: 0 } }, 
      topRightCol: { offsetWidth: { value: 0 } }}})
    renderHook(() => useLayoutMeasurements())
    expect(setPropertySpy).toHaveBeenCalledWith('--top-col-width', '0px')
  })

  test('dispatches safe zone inset', () => {
    const { dispatch, layoutRefs } = setup()
    getSafeZoneInset.mockReturnValue({ top: 10, right: 5, bottom: 15, left: 5 })
    
    renderHook(() => useLayoutMeasurements())
    
    expect(getSafeZoneInset).toHaveBeenCalledWith(layoutRefs)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SAFE_ZONE_INSET',
      payload: { safeZoneInset: { top: 10, right: 5, bottom: 15, left: 5 } }
    })
  })

  test('recalculates on breakpoint, mapSize, and isMapReady changes', () => {
    const { rerender } = renderHook(() => useLayoutMeasurements())

    const props = [{ app: { breakpoint: 'lg' } }, { map: { mapSize: { width: 1000, height: 800 } } }, { map: { isMapReady: false } }]
    props.forEach(override => {
      setPropertySpy.mockClear()
      setup(override)
      rerender()
      expect(setPropertySpy).toHaveBeenCalled()
    })
  })

  test('sets up resize observer and recalculates on callback', () => {
    const { layoutRefs } = setup()
    renderHook(() => useLayoutMeasurements())
    
    expect(useResizeObserver).toHaveBeenCalledWith(
      [layoutRefs.bannerRef, layoutRefs.topRightColRef, layoutRefs.mainRef, layoutRefs.insetRef, layoutRefs.actionsRef],
      expect.any(Function)
    )

    setPropertySpy.mockClear()
    useResizeObserver.mock.calls[0][1]() // call the callback
    expect(rafSpy).toHaveBeenCalled()
    expect(setPropertySpy).toHaveBeenCalled()
  })
})
