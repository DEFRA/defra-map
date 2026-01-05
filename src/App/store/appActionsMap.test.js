import { actionsMap } from './appActionsMap.js'
import * as panelRegistry from '../registry/panelRegistry.js'
import * as getInitialOpenPanelsModule from '../../config/getInitialOpenPanels.js'
import * as shallowEqualModule from '../../utils/shallowEqual.js'
import * as getIsFullscreenModule from '../../utils/getIsFullscreen.js'

describe('actionsMap', () => {
  let state

  beforeEach(() => {
    state = {
      mode: 'view',
      previousMode: 'edit',
      breakpoint: 'desktop',
      interfaceType: 'default',
      openPanels: { panel1: { props: {} } },
      previousOpenPanels: {},
      hasExclusiveControl: false,
      safeZoneInset: { top: 0, bottom: 0 },
      isLayoutReady: false,
      syncMapPadding: true,
      disabledButtons: new Set(['btn1']),
      hiddenButtons: new Set(['btn3']),
      pressedButtons: new Set(['btn5'])
    }

    // Mock realistic panel config including breakpoints + exclusive/modal flags
    jest.spyOn(panelRegistry, 'getPanelConfig').mockReturnValue({
      panel1: {
        desktop: { exclusive: true, modal: false, initiallyOpen: true },
        mobile: { exclusive: true, modal: false }
      },
      panel2: {
        desktop: { exclusive: false, modal: true },
        mobile: { exclusive: false, modal: true }
      },
      panel3: {
        desktop: { exclusive: false, modal: false },
        mobile: { exclusive: false, modal: false }
      }
    })

    jest.spyOn(getInitialOpenPanelsModule, 'getInitialOpenPanels').mockImplementation(
      () => ({ panel1: { props: {} } })
    )

    jest.spyOn(shallowEqualModule, 'shallowEqual').mockImplementation(
      (a, b) => JSON.stringify(a) === JSON.stringify(b)
    )

    jest.spyOn(getIsFullscreenModule, 'getIsFullscreen').mockReturnValue(false)
  })

  afterEach(() => jest.restoreAllMocks())

  test('SET_BREAKPOINT sets breakpoint, isFullscreen, and openPanels (both branches)', () => {
    const payload = { breakpoint: 'mobile', behaviour: 'responsive' }

    // Branch 1 — lastPanelId exists (normal state)
    getIsFullscreenModule.getIsFullscreen.mockReturnValueOnce(true)
    const result1 = actionsMap.SET_BREAKPOINT(state, payload)

    expect(result1.breakpoint).toBe('mobile')
    expect(result1.isFullscreen).toBe(true)
    expect(result1.openPanels).toHaveProperty('panel1') // last panel rebuilt
    expect(getIsFullscreenModule.getIsFullscreen).toHaveBeenCalledWith('responsive', 'mobile')

    // Branch 2 — lastPanelId does NOT exist (openPanels empty)
    const emptyState = { ...state, openPanels: {} }
    getIsFullscreenModule.getIsFullscreen.mockReturnValueOnce(false)
    const result2 = actionsMap.SET_BREAKPOINT(emptyState, payload)

    expect(result2.breakpoint).toBe('mobile')
    expect(result2.isFullscreen).toBe(false)
    expect(result2.openPanels).toEqual({}) // falsy branch executed
  })

  test('SET_MEDIA merges payload into state', () => {
    const payload = { interfaceType: 'compact', mode: 'edit' }
    const result = actionsMap.SET_MEDIA(state, payload)
    expect(result).toMatchObject(payload)
  })

  test('SET_INTERFACE_TYPE sets interfaceType', () => {
    const result = actionsMap.SET_INTERFACE_TYPE(state, 'compact')
    expect(result.interfaceType).toBe('compact')
  })

  test('SET_MODE updates mode, previousMode, and openPanels', () => {
    const result = actionsMap.SET_MODE(state, 'edit')
    expect(result.mode).toBe('edit')
    expect(result.previousMode).toBe('view')
    expect(result.openPanels).toHaveProperty('panel1')
  })

  test('REVERT_MODE swaps mode and previousMode and updates openPanels', () => {
    const result = actionsMap.REVERT_MODE(state)
    expect(result.mode).toBe('edit')
    expect(result.previousMode).toBe('view')
    expect(result.openPanels).toHaveProperty('panel1')
  })

  test('OPEN_PANEL adds a panel with props', () => {
    const result = actionsMap.OPEN_PANEL(state, { panelId: 'panel2', props: { foo: 'bar' } })
    expect(result.openPanels.panel2?.props).toEqual({ foo: 'bar' })
    expect(result.previousOpenPanels).toBe(state.openPanels)
  })

  test('OPEN_PANEL defaults props to empty object', () => {
    const result = actionsMap.OPEN_PANEL(state, { panelId: 'panel3' })
    expect(result.openPanels.panel3?.props).toEqual({})
  })

  test('CLOSE_PANEL removes a panel', () => {
    const result = actionsMap.CLOSE_PANEL(state, 'panel1')
    expect(result.openPanels.panel1).toBeUndefined()
    expect(result.previousOpenPanels).toBe(state.openPanels)
  })

  test('CLOSE_ALL_PANELS clears openPanels', () => {
    const result = actionsMap.CLOSE_ALL_PANELS(state)
    expect(result.openPanels).toEqual({})
    expect(result.previousOpenPanels).toBe(state.openPanels)
  })

  test('RESTORE_PREVIOUS_PANELS restores previousOpenPanels or uses empty object if undefined', () => {
    // Case 1: previousOpenPanels exists
    let result = actionsMap.RESTORE_PREVIOUS_PANELS(state)
    expect(result.openPanels).toBe(state.previousOpenPanels)
    expect(result.previousOpenPanels).toBe(state.openPanels)

    // Case 2: previousOpenPanels undefined -> fallback {}
    const localState = { ...state, previousOpenPanels: undefined }
    result = actionsMap.RESTORE_PREVIOUS_PANELS(localState)
    expect(result.openPanels).toEqual({})
    expect(result.previousOpenPanels).toBe(localState.openPanels)
  })

  test('TOGGLE_HAS_EXCLUSIVE_CONTROL sets hasExclusiveControl', () => {
    const result = actionsMap.TOGGLE_HAS_EXCLUSIVE_CONTROL(state, true)
    expect(result.hasExclusiveControl).toBe(true)
  })

  describe('SET_SAFE_ZONE_INSET', () => {
    test('updates safeZoneInset when changed', () => {
      const inset = { top: 10, bottom: 10 }
      shallowEqualModule.shallowEqual.mockReturnValueOnce(false)

      const result = actionsMap.SET_SAFE_ZONE_INSET(state, { safeZoneInset: inset, syncMapPadding: false })

      expect(result.safeZoneInset).toMatchObject(inset)
      expect(result.syncMapPadding).toBe(false)
      expect(result.isLayoutReady).toBe(true)
    })

    test('returns same state if shallowEqual returns true', () => {
      shallowEqualModule.shallowEqual.mockReturnValueOnce(true)
      const result = actionsMap.SET_SAFE_ZONE_INSET(state, { safeZoneInset: { top: 0, bottom: 0 } })
      expect(result).toBe(state)
    })
  })

  describe('TOGGLE_BUTTON_DISABLED', () => {
    test('adds or removes button from disabledButtons', () => {
      const result1 = actionsMap.TOGGLE_BUTTON_DISABLED(state, { id: 'btn2', isDisabled: true })
      expect(result1.disabledButtons.has('btn2')).toBe(true)

      const result2 = actionsMap.TOGGLE_BUTTON_DISABLED(state, { id: 'btn1', isDisabled: false })
      expect(result2.disabledButtons.has('btn1')).toBe(false)
    })
  })

  describe('TOGGLE_BUTTON_HIDDEN', () => {
    test('adds or removes button from hiddenButtons', () => {
      const result1 = actionsMap.TOGGLE_BUTTON_HIDDEN(state, { id: 'btn4', isHidden: true })
      expect(result1.hiddenButtons.has('btn4')).toBe(true)

      const result2 = actionsMap.TOGGLE_BUTTON_HIDDEN(state, { id: 'btn3', isHidden: false })
      expect(result2.hiddenButtons.has('btn3')).toBe(false)
    })
  })

  describe('TOGGLE_BUTTON_PRESSED', () => {
    test('adds or removes button from pressedButtons', () => {
      const result1 = actionsMap.TOGGLE_BUTTON_PRESSED(state, { id: 'btn6', isPressed: true })
      expect(result1.pressedButtons.has('btn6')).toBe(true)

      const result2 = actionsMap.TOGGLE_BUTTON_PRESSED(state, { id: 'btn5', isPressed: false })
      expect(result2.pressedButtons.has('btn5')).toBe(false)
    })
  })
})
