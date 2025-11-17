// src/plugins/zoomControls/manifest.js
import { ZoomControlsInit } from './ZoomControlsInit.jsx'
import { Plus, Minus } from 'lucide-react'

export const manifest = {
  InitComponent: ZoomControlsInit,

  buttons: [{
    id: 'zoomIn',
    group: 'zoom',
    label: 'Zoom in',
    iconId: 'plus',
    tablet: {
      slot: 'right-top',
      showLabel: false
    },
    desktop: {
      slot: 'right-top',
      showLabel: false
    }
  }, {
    id: 'zoomOut',
    group: 'zoom',
    label: 'Zoom out',
    iconId: 'minus',
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
    id: 'plus',
    component: Plus
  }, {
    id: 'minus',
    component: Minus
  }]
}
