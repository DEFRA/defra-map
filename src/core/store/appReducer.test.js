import { initialState, reducer } from './appReducer.js'
import { actionsMap } from './appActionsMap.js'
import * as mediaState from '../../utils/getMediaState.js'
import * as initialOpenPanels from '../../config/getInitialOpenPanels.js'
import * as fullscreenUtils from '../../utils/getIsFullscreen.js'

describe('initialState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockMedia = (overrides = {}) => {
    jest.spyOn(mediaState, 'getMediaState').mockReturnValue({
      preferredColorScheme: 'dark',
      prefersReducedMotion: true,
      ...overrides
    })
  }

  const mockPanels = (value = {}) => {
    jest.spyOn(initialOpenPanels, 'getInitialOpenPanels').mockReturnValue(value)
  }

  const mockFullscreen = (value) => {
    jest.spyOn(fullscreenUtils, 'getIsFullscreen').mockReturnValue(value)
  }

  test('returns correct initial state when autoColorScheme is true', () => {
    mockMedia()
    mockPanels({ panel1: true })
    mockFullscreen(true)

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
      preferredColorScheme: 'dark',
      prefersReducedMotion: true,
      isFullscreen: true,
      mode: 'edit',
      previousMode: null,
      safeZoneInset: null,
      disabledButtons: new Set(),
      hiddenButtons: new Set(),
      pressedButtons: new Set(),
      hasExclusiveControl: false,
      openPanels: { panel1: true },
      previousOpenPanels: {},
      syncMapPadding: true
    })

    expect(initialOpenPanels.getInitialOpenPanels)
      .toHaveBeenCalledWith({ panel1: {} }, 'sm')

    expect(fullscreenUtils.getIsFullscreen)
      .toHaveBeenCalledWith('responsive', 'sm')
  })

  test('uses appColorScheme when autoColorScheme is false', () => {
    mockMedia({ prefersReducedMotion: false })
    mockPanels({})
    mockFullscreen(false)

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
  })

  test('defaults mode to null when missing', () => {
    mockMedia({ prefersReducedMotion: false })
    mockPanels({})
    mockFullscreen(false)

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
    expect(result.isFullscreen).toBe(false)
  })
})

describe('reducer', () => {
  test('calls mapped action handler', () => {
    const state = { value: 0 }
    const payload = 123
    const fn = jest.fn().mockReturnValue({ value: 123 })

    actionsMap.TEST_ACTION = fn

    const result = reducer(state, { type: 'TEST_ACTION', payload })

    expect(fn).toHaveBeenCalledWith(state, payload)
    expect(result).toEqual({ value: 123 })

    delete actionsMap.TEST_ACTION
  })

  test('returns original state when action not found', () => {
    const state = { test: true }
    const result = reducer(state, { type: 'NOPE' })
    expect(result).toBe(state)
  })
})
