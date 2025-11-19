// src/plugins/dataLayers/manifest.js
import { initialState, actions } from './reducer.js'
import { DataLayersInit } from './DataLayersInit.jsx'
import { DataLayers } from './DataLayers.jsx'
import { Layers2 } from 'lucide-react'

export const manifest = {
  InitComponent: DataLayersInit,

  reducer: {
    initialState,
    actions
  },

  panels: [{
    id: 'dataLayers',
    label: 'Layers',
    mobile: {
      slot: 'drawer',
      modal: true,
      dismissable: true
    },
    tablet: {
      slot: 'inset',
      // modal: true,
      dismissable: true,
      width: '300px'
    },
    desktop: {
      slot: 'inset',
      // initiallyOpen: true,
      modal: false,
      dismissable: true,
      width: '320px'
    },
    render: DataLayers
  }],

  buttons: [{
    id: 'dataLayers',
    label: 'Layers',
    panelId: 'dataLayers',
    iconId: 'layers',
    mobile: {
      slot: 'top-left',
      showLabel: true
    },
    tablet: {
      slot: 'top-left',
      showLabel: true
    },
    desktop: {
      slot: 'top-left',
      showLabel: true
    }
  }],

  icons: [{
    id: 'layers',
    component: Layers2
  }]
}
