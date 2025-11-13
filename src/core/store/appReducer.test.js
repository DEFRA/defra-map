import { initialState, reducer } from './appReducer.js'
import { actionsMap } from './appActionsMap.js'
import * as mediaState from '../../utils/getMediaState.js'
import * as initialOpenPanels from '../../config/getInitialOpenPanels.js'
import * as fullscreenUtils from '../../utils/getIsFullscreen.js'

describe('initialState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns correct initial state with autoColorScheme true', () => {
    jest.spyOn(mediaState, 'getMediaState').mockReturnValue({
      preferredColorScheme: 'dark',
      prefersReducedMotion: true
    })

    jest.spyOn(initialOpenPanels, 'getInitialOpenPanels').mockReturnValue({ panel1: true })
    jest.spyOn(fullscreenUtils, 'getIsFullscreen').mockReturnValue(true)

    const config = {
      behaviour: 'responsive',
      initialBreakpoint: 'sm',
      initialInterfaceType: 'mobile',
      appColorScheme: 'light',
      autoColorScheme: true,
      panelConfig: { panel1: {} },
      mode: 'edit'
    }

    const result = initialState(config)

    expect(result).toEqual({
      isLayoutReady: false,
      breakpoint: 'sm',
      interfaceType: 'mobile',
      preferredColorScheme: 'dark', // from getMediaState since autoColorScheme=true
      prefersReducedMotion: true,
      isFullscreen: true, // computed via getIsFullscreen
      mode: 'edit',
      previousMode: null,
      safeZoneInset: null,
      disabledButtons: new Set(),
      hiddenButtons: new Set(),
      hasExclusiveControl: false,
      openPanels: { panel1: true },
      previousOpenPanels: {},
      syncMapPadding: true
    })

    expect(initialOpenPanels.getInitialOpenPanels).toHaveBeenCalledWith({ panel1: {} }, 'sm')
    expect(fullscreenUtils.getIsFullscreen).toHaveBeenCalledWith('responsive', 'sm')
  })

  test('uses appColorScheme if autoColorScheme is false', () => {
    jest.spyOn(mediaState, 'getMediaState').mockReturnValue({
      preferredColorScheme: 'dark',
      prefersReducedMotion: false
    })

    jest.spyOn(initialOpenPanels, 'getInitialOpenPanels').mockReturnValue({})
    jest.spyOn(fullscreenUtils, 'getIsFullscreen').mockReturnValue(false)

    const config = {
      behaviour: 'standard',
      initialBreakpoint: 'lg',
      initialInterfaceType: 'desktop',
      appColorScheme: 'light',
      autoColorScheme: false,
      panelConfig: {},
      mode: null
    }

    const result = initialState(config)
    expect(result.preferredColorScheme).toBe('light')
    expect(result.prefersReducedMotion).toBe(false)
    expect(result.isFullscreen).toBe(false)
    expect(result.syncMapPadding).toBe(true)
    expect(fullscreenUtils.getIsFullscreen).toHaveBeenCalledWith('standard', 'lg')
  })

  test('defaults mode to null if not provided', () => {
    jest.spyOn(mediaState, 'getMediaState').mockReturnValue({
      preferredColorScheme: 'dark',
      prefersReducedMotion: false
    })

    jest.spyOn(initialOpenPanels, 'getInitialOpenPanels').mockReturnValue({})
    jest.spyOn(fullscreenUtils, 'getIsFullscreen').mockReturnValue(false)

    const config = {
      behaviour: 'minimal',
      initialBreakpoint: 'md',
      initialInterfaceType: 'tablet',
      appColorScheme: 'light',
      autoColorScheme: true,
      panelConfig: {}
    }

    const result = initialState(config)
    expect(result.mode).toBeNull()
    expect(result.syncMapPadding).toBe(true)
    expect(result.isFullscreen).toBe(false)
  })
})

describe('reducer', () => {
  test('calls the corresponding action function if type exists', () => {
    const state = { value: 0 }
    const payload = 5
    const mockFn = jest.fn().mockReturnValue({ value: 5 })

    const type = 'TEST_ACTION'
    actionsMap[type] = mockFn

    const result = reducer(state, { type, payload })
    expect(mockFn).toHaveBeenCalledWith(state, payload)
    expect(result).toEqual({ value: 5 })

    delete actionsMap[type]
  })

  test('returns current state if action type does not exist', () => {
    const state = { value: 1 }
    const result = reducer(state, { type: 'UNKNOWN', payload: 999 })
    expect(result).toBe(state)
  })
})
