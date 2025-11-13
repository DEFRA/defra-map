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
      hiddenButtons: new Set(['btn3'])
    }
    jest.spyOn(panelRegistry, 'getPanelConfig').mockReturnValue({ panel1: {} })
    jest.spyOn(getInitialOpenPanelsModule, 'getInitialOpenPanels').mockImplementation(() => ({ panel1: { props: {} } }))
    jest.spyOn(shallowEqualModule, 'shallowEqual').mockImplementation((a, b) => JSON.stringify(a) === JSON.stringify(b))
    jest.spyOn(getIsFullscreenModule, 'getIsFullscreen').mockReturnValue(false)
  })

  afterEach(() => jest.restoreAllMocks())

  test('SET_BREAKPOINT sets breakpoint and isFullscreen', () => {
    const payload = { breakpoint: 'mobile', behaviour: 'responsive' }
    getIsFullscreenModule.getIsFullscreen.mockReturnValueOnce(true)
    const result = actionsMap.SET_BREAKPOINT(state, payload)
    expect(result.breakpoint).toBe('mobile')
    expect(result.isFullscreen).toBe(true)
    expect(getIsFullscreenModule.getIsFullscreen).toHaveBeenCalledWith('responsive', 'mobile')
  })

  test('SET_MEDIA merges payload into state', () => {
    const payload = { interfaceType: 'compact', mode: 'edit' }
    const result = actionsMap.SET_MEDIA(state, payload)
    expect(result).toMatchObject(payload)
  })

  test('SET_INTERFACE_TYPE sets interfaceType', () => {
    expect(actionsMap.SET_INTERFACE_TYPE(state, 'compact').interfaceType).toBe('compact')
  })

  test('SET_MODE updates mode, previousMode, and openPanels', () => {
    const result = actionsMap.SET_MODE(state, 'edit')
    expect(result).toMatchObject({ mode: 'edit', previousMode: 'view' })
    expect(result.openPanels).toHaveProperty('panel1')
  })

  test('REVERT_MODE swaps mode and previousMode and updates openPanels', () => {
    const result = actionsMap.REVERT_MODE(state)
    expect(result).toMatchObject({ mode: 'edit', previousMode: 'view' })
    expect(result.openPanels).toHaveProperty('panel1')
  })

  test('OPEN_PANEL adds a panel with props', () => {
    const result = actionsMap.OPEN_PANEL(state, { panelId: 'panel2', props: { foo: 'bar' } })
    expect(result.openPanels.panel2.props).toEqual({ foo: 'bar' })
    expect(result.previousOpenPanels).toBe(state.openPanels)
  })

  test('OPEN_PANEL defaults props to empty object', () => {
    expect(actionsMap.OPEN_PANEL(state, { panelId: 'panel3' }).openPanels.panel3.props).toEqual({})
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

    // Case 2: previousOpenPanels undefined -> triggers fallback {}
    const localState = { ...state, previousOpenPanels: undefined }
    result = actionsMap.RESTORE_PREVIOUS_PANELS(localState)
    expect(result.openPanels).toEqual({})
    expect(result.previousOpenPanels).toBe(localState.openPanels)
  })


  test('TOGGLE_HAS_EXCLUSIVE_CONTROL sets hasExclusiveControl', () => {
    expect(actionsMap.TOGGLE_HAS_EXCLUSIVE_CONTROL(state, true).hasExclusiveControl).toBe(true)
  })

  describe('SET_SAFE_ZONE_INSET', () => {
    test('updates safeZoneInset when changed', () => {
      const inset = { top: 10, bottom: 10 }
      shallowEqualModule.shallowEqual.mockReturnValueOnce(false)
      const result = actionsMap.SET_SAFE_ZONE_INSET(state, { safeZoneInset: inset, syncMapPadding: false })
      expect(result).toMatchObject({ safeZoneInset: inset, syncMapPadding: false, isLayoutReady: true })
    })

    test('returns same state if shallowEqual returns true', () => {
      shallowEqualModule.shallowEqual.mockReturnValueOnce(true)
      expect(actionsMap.SET_SAFE_ZONE_INSET(state, { safeZoneInset: { top: 0, bottom: 0 } })).toBe(state)
    })
  })

  describe('TOGGLE_BUTTON_DISABLED', () => {
    test('adds or removes button from disabledButtons', () => {
      expect(actionsMap.TOGGLE_BUTTON_DISABLED(state, { id: 'btn2', isDisabled: true }).disabledButtons.has('btn2')).toBe(true)
      expect(actionsMap.TOGGLE_BUTTON_DISABLED(state, { id: 'btn1', isDisabled: false }).disabledButtons.has('btn1')).toBe(false)
    })
  })

  describe('TOGGLE_BUTTON_HIDDEN', () => {
    test('adds or removes button from hiddenButtons', () => {
      expect(actionsMap.TOGGLE_BUTTON_HIDDEN(state, { id: 'btn4', isHidden: true }).hiddenButtons.has('btn4')).toBe(true)
      expect(actionsMap.TOGGLE_BUTTON_HIDDEN(state, { id: 'btn3', isHidden: false }).hiddenButtons.has('btn3')).toBe(false)
    })
  })
})
