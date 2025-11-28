// /plugins/map-styles/manifest.js
import { MapStylesInit } from './MapStylesInit.jsx'
import { MapStyles } from './MapStyles.jsx'
import { Map } from 'lucide-react'

export const manifest = {
  InitComponent: MapStylesInit,

  panels: [{
    id: 'mapStyles',
    label: 'Map styles',
    mobile: {
      slot: 'bottom',
      modal: true,
      dismissable: true
    },
    tablet: {
      slot: 'map-styles-button',
      modal: true,
      width: '400px',
      dismissable: true
    },
    desktop: {
      slot: 'map-styles-button',
      modal: true,
      width: '400px',
      dismissable: true
    },
    render: MapStyles // will be wrapped automatically
  }],

  buttons: [{
    id: 'mapStyles',
    label: 'Map styles',
    panelId: 'mapStyles',
    iconId: 'map',
    mobile: {
      slot: 'right-top',
      showLabel: false
    },
    tablet: {
      slot: 'right-top',
      showLabel: false
    },
    desktop: {
      slot: 'right-top',
      showLabel: false
    }
  }],

  icons: [{
    id: 'map',
    component: Map
  }]
}
