import { KeyboardHelp } from '../core/components/KeyboardHelp/KeyboardHelp.jsx'

const breakpointDefinition = {
  slot: 'middle',
  initiallyOpen: false,
  dismissable: true,
  modal: true
  // width: '80%'
}

export const appConfig = {
  panels: [{
    id: 'keyboardHelp',
    label: 'Keyboard shortcuts',
    mobile: {
      ...breakpointDefinition
    },
    tablet: {
      ...breakpointDefinition,
      width: '500px'
    },
    desktop: {
      ...breakpointDefinition,
      width: '500px'
    },
    render: () => <KeyboardHelp />
  }]
}

export const scaleFactor = {
  small: 1,
  medium: 1.5,
  large: 2
}