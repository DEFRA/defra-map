import { actionsMap } from './appActionsMap.js'
import { getMediaState } from '../../utils/getMediaState.js'
import { getIsFullscreen } from '../../utils/getIsFullscreen.js'
import { getInitialOpenPanels } from '../../config/getInitialOpenPanels.js'

export const initialState = (config) => {
  const {
    behaviour,
    initialBreakpoint,
    initialInterfaceType,
    appColorScheme,
    autoColorScheme,
    pluginRegistry,
    buttonRegistry,
    panelRegistry,
    controlRegistry,
    mode
  } = config

  const {
    preferredColorScheme,
    prefersReducedMotion
  } = getMediaState()

  // Initial isFullscreen
  const isFullscreen = getIsFullscreen(behaviour, initialBreakpoint)

  // Initial open panels
  const panelConfig = panelRegistry.getPanelConfig()
  const openPanels = getInitialOpenPanels(panelConfig, initialBreakpoint)

  return {
    isLayoutReady: false,
    breakpoint: initialBreakpoint,
    interfaceType: initialInterfaceType,
    preferredColorScheme: autoColorScheme ? preferredColorScheme : appColorScheme,
    prefersReducedMotion,
    isFullscreen,
    mode: mode || null,
    previousMode: null,
    safeZoneInset: null,
    disabledButtons: new Set(),
    hiddenButtons: new Set(),
    pressedButtons: new Set(),
    hasExclusiveControl: false,
    openPanels,
    previousOpenPanels: {},
    syncMapPadding: true,
    pluginRegistry,
    buttonRegistry,
    panelRegistry,
    controlRegistry
  }
}

export const reducer = (state, action) => {
  const { type, payload } = action
  const fn = actionsMap[type]
  if (fn) {
    return fn(state, payload)
  }
  return state
}
