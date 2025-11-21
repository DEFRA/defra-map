// /plugins/use-location/manifest.js
import { initialState, actions } from './reducer.js'
import { UseLocationInit } from './UseLocationInit.jsx'
import { UseLocation } from './UseLocation.jsx'
import { LocateFixed } from 'lucide-react'

const buttonSlot = {
  slot: 'right-top',
  showLabel: false
}

export const manifest = {
  InitComponent: UseLocationInit,

  reducer: {
    initialState,
    actions
  },

  buttons: [{
    id: 'useLocation',
    group: 'location',
    label: 'Use your location',
    iconId: 'locateFixed',
    hiddenWhen: () => !navigator.geolocation,
    mobile: buttonSlot,
    tablet: buttonSlot,
    desktop: buttonSlot
  }],

  panels: [{
    id: 'useLocation',
    label: 'Problem getting your location',
    mobile: {
      slot: 'banner',
      initiallyOpen: false,
      dismissable: true,
      modal: true
    },
    tablet: {
      slot: 'banner',
      initiallyOpen: false,
      dismissable: true,
      modal: true
    },
    desktop: {
      slot: 'banner',
      initiallyOpen: false,
      dismissable: true,
      modal: true
    },
    render: UseLocation
  }],

  icons: [{
    id: 'locateFixed',
    component: LocateFixed
  }]
}
