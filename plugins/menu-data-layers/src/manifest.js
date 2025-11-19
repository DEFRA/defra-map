// src/plugins/menuDataLayers/manifest.js
import { initialState, actions } from './reducer.js'
import { MenuDataLayersInit } from './MenuDataLayersInit.jsx'
import { MenuDataLayers } from './MenuDataLayers.jsx'
import { Layers2 } from 'lucide-react'

export const manifest = {
  InitComponent: MenuDataLayersInit,

  reducer: {
    initialState,
    actions
  },

  panels: [{
    id: 'menuDataLayers',
    label: 'Menu',
    mobile: {
      slot: 'side',
      modal: true,
      dismissable: true,
      width: '80%'
    },
    tablet: {
      slot: 'side',
      // modal: true,
      dismissable: true,
      width: '260px'
    },
    desktop: {
      slot: 'side',
      initiallyOpen: true,
      modal: false,
      dismissable: true,
      width: '280px'
    },
    render: MenuDataLayers
  }],

  buttons: [{
    id: 'menuDataLayers',
    label: 'Layers',
    panelId: 'menuDataLayers',
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
  }],

  // Direct plugin API
  api: {
    add () {
      console.log('Add data layer')
    }
  }
}
