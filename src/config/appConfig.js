import { KeyboardHelp } from '../App/components/KeyboardHelp/KeyboardHelp.jsx'

const keyboardBasePanelSlots = {
  slot: 'middle',
  initiallyOpen: false,
  dismissable: true,
  modal: true
}

const buttonSlots = {
  slot: 'right-top',
  showLabel: false,
  order: 10
}

const exitButtonSlots = {
  slot: 'top-left',
  showLabel: false,
  order: -1
}

// Default app buttons, panels and icons
export const appConfig = {
  buttons: [{
    id: 'exit',
    label: 'Exit',
    iconId: 'close',
    onClick: (e, { services }) => services.closeApp(),
    excludeWhen: ({ appConfig, appState }) => !appConfig.hasExitButton || !(appState.isFullscreen && (new URL(window.location.href)).searchParams.has(appConfig.mapViewParamKey)),
    mobile: exitButtonSlots,
    tablet: exitButtonSlots,
    desktop: exitButtonSlots
  }, {
    id: 'fullscreen',
    label: () => `${document.fullscreenElement ? 'Exit' : 'Enter'} fullscreen`,
    iconId: () => document.fullscreenElement ? 'minimise' : 'maximise',
    onClick: (e, { appState }) => {
      const container = appState.layoutRefs.appContainerRef.current
      document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen()
    },
    excludeWhen: ({ appState, appConfig }) => !appConfig.enableFullscreen || appState.isFullscreen,
    mobile: buttonSlots,
    tablet: buttonSlots,
    desktop: buttonSlots
  }],

  panels: [{
    id: 'keyboardHelp',
    label: 'Keyboard shortcuts',
    mobile: {
      ...keyboardBasePanelSlots
    },
    tablet: {
      ...keyboardBasePanelSlots,
      width: '500px'
    },
    desktop: {
      ...keyboardBasePanelSlots,
      width: '500px'
    },
    render: () => <KeyboardHelp />
  }],

  icons: [{
    id: 'maximise',
    svgContent: '<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/>'
  }, {
    id: 'minimise',
    svgContent: '<path d="m14 10 7-7"/><path d="M20 10h-6V4"/><path d="m3 21 7-7"/><path d="M4 14h6v6"/>'
  }]
}

// Used by addButton
const defaultButtonSlots = {
  slot: 'right-top',
  showLabel: false
}

export const defaultButtonConfig = {
  label: 'Button',
  mobile: defaultButtonSlots,
  tablet: defaultButtonSlots,
  desktop: defaultButtonSlots
}

// Used by addPanel
export const defaultPanelConfig = {
  showLabel: true,
  label: 'Panel',
  mobile: {
    slot: 'bottom',
    initiallyOpen: true,
    dismissable: true,
    modal: false
  },
  tablet: {
    slot: 'inset',
    initiallyOpen: true,
    dismissable: true,
    modal: false
  },
  desktop: {
    slot: 'inset',
    initiallyOpen: true,
    dismissable: true,
    modal: false
  },
  render: null,
  html: null
}

// Used by addControl
export const defaultControlConfig = {
  label: 'Control',
  mobile: {
    slot: 'bottom'
  },
  tablet: {
    slot: 'inset'
  },
  desktop: {
    slot: 'inset'
  }
}

export const scaleFactor = {
  small: 1,
  medium: 1.5,
  large: 2
}

export const markerSvgPaths = [{
  shape: 'pin',
  backgroundPath: 'M31 16.001c0 7.489-8.308 15.289-11.098 17.698-.533.4-1.271.4-1.803 0C15.309 31.29 7 23.49 7 16.001c0-6.583 5.417-12 12-12s12 5.417 12 12z',
  graphicPath: 'M19 11.001c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.241 5-5-2.24-5-5-5z'
}]
