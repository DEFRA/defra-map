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

export const markerSvgPaths = [{
  shape: 'teardrop',
  backgroundPath: 'M31 16.001c0 7.489-8.308 15.289-11.098 17.698-.533.4-1.271.4-1.803 0C15.309 31.29 7 23.49 7 16.001c0-6.583 5.417-12 12-12s12 5.417 12 12z',
  graphicPath: 'M19 11.001c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.241 5-5-2.24-5-5-5z'
}]