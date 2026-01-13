// import { getPanelConfig } from '../registry/panelRegistry.js'
import { getInitialOpenPanels } from '../../config/getInitialOpenPanels.js'
import { getIsFullscreen } from '../../utils/getIsFullscreen.js'
import { shallowEqual } from '../../utils/shallowEqual.js'

// Interal helper
function buildOpenPanels(state, panelId, breakpoint, props) {
  const panelConfig = state.panelRegistry.getPanelConfig()
  const bpConfig = panelConfig[panelId]?.[breakpoint]
  const isExclusiveNonModal = !!bpConfig.exclusive && !bpConfig.modal
  const isModal = !!bpConfig.modal

  // Remove exclusive panels
  const filteredPanels = Object.fromEntries(
    Object.entries(state.openPanels).filter(
      ([key]) => !panelConfig[key]?.[breakpoint]?.exclusive
    )
  )

  return {
    ...(isExclusiveNonModal ? {} : filteredPanels),
    ...(isModal ? state.openPanels : {}),
    [panelId]: { props }
  }
}

const setMode = (state, payload) => {
  const panelConfig = state.panelRegistry.getPanelConfig()

  return {
    ...state,
    mode: payload,
    previousMode: state.mode,
    openPanels: getInitialOpenPanels(panelConfig, state.breakpoint, state.openPanels)
  }
}

const revertMode = (state) => {
  const panelConfig = state.panelRegistry.getPanelConfig()

  return {
    ...state,
    mode: state.previousMode,
    previousMode: state.mode,
    openPanels: getInitialOpenPanels(panelConfig, state.breakpoint, state.openPanels)
  }
}

const setMedia = (state, payload) => {
  return {
    ...state,
    ...payload
  }
}

const setBreakpoint = (state, payload) => {
  const isFullscreen = getIsFullscreen(payload.behaviour, payload.breakpoint)
  const panelIds = Object.keys(state.openPanels)
  const lastPanelId = panelIds.at(-1)
  
  return {
    ...state,
    breakpoint: payload.breakpoint,
    isFullscreen,
    previousOpenPanels: state.openPanels,
    openPanels: lastPanelId
      ? buildOpenPanels(
          state,
          lastPanelId,
          payload.breakpoint,
          state.openPanels[lastPanelId]?.props || {}
        )
      : {}
  }
}

const setInterfaceType = (state, payload) => {
  return {
    ...state,
    interfaceType: payload
  }
}

const openPanel = (state, payload) => {
  const { panelId, props = {} } = payload

  return {
    ...state,
    previousOpenPanels: state.openPanels,
    openPanels: buildOpenPanels(state, panelId, state.breakpoint, props)
  }
}


const closePanel = (state, payload) => {
  // eslint-disable-next-line no-unused-vars
  const { [payload]: _, ...remainingPanels } = state.openPanels

  return {
    ...state,
    previousOpenPanels: state.openPanels,
    openPanels: remainingPanels
  }
}

const closeAllPanels = (state) => {
  return {
    ...state,
    previousOpenPanels: state.openPanels,
    openPanels: {}
  }
}

const restorePreviousPanels = (state) => {
  return {
    ...state,
    openPanels: state.previousOpenPanels || {},
    previousOpenPanels: state.openPanels
  }
}

const toggleHasExclusiveControl = (state, payload) => {
  return {
    ...state,
    hasExclusiveControl: payload
  }
}

const setSafeZoneInset = (state, { safeZoneInset, syncMapPadding = true }) => {
  return shallowEqual(state.safeZoneInset, safeZoneInset)
    ? state
    : {
        ...state,
        safeZoneInset,
        syncMapPadding,
        isLayoutReady: true
      }
}

const toggleButtonDisabled = (state, payload) => {
  const { id, isDisabled } = payload
  const updated = new Set(state.disabledButtons)

  if (isDisabled) {
    updated.add(id)
  } else {
    updated.delete(id)
  }

  return {
    ...state,
    disabledButtons: updated
  }
}

const toggleButtonHidden = (state, payload) => {
  const { id, isHidden } = payload
  const updated = new Set(state.hiddenButtons)

  if (isHidden) {
    updated.add(id)
  } else {
    updated.delete(id)
  }

  return {
    ...state,
    hiddenButtons: updated
  }
}

const toggleButtonPressed = (state, payload) => {
  const { id, isPressed } = payload
  const updated = new Set(state.pressedButtons)

  if (isPressed) {
    updated.add(id)
  } else {
    updated.delete(id)
  }

  return {
    ...state,
    pressedButtons: updated
  }
}

export const actionsMap = {
  SET_BREAKPOINT: setBreakpoint,
  SET_MEDIA: setMedia,
  SET_INTERFACE_TYPE: setInterfaceType,
  SET_MODE: setMode,
  SET_SAFE_ZONE_INSET: setSafeZoneInset,
  REVERT_MODE: revertMode,
  OPEN_PANEL: openPanel,
  CLOSE_PANEL: closePanel,
  CLOSE_ALL_PANELS: closeAllPanels,
  RESTORE_PREVIOUS_PANELS: restorePreviousPanels,
  TOGGLE_HAS_EXCLUSIVE_CONTROL: toggleHasExclusiveControl,
  TOGGLE_BUTTON_DISABLED: toggleButtonDisabled,
  TOGGLE_BUTTON_HIDDEN: toggleButtonHidden,
  TOGGLE_BUTTON_PRESSED: toggleButtonPressed
}
