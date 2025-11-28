// /plugins/zoom-controls/manifest.js
import { ZoomControlsInit } from './ZoomControlsInit.jsx'

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
    svgContent: '<path d="M5 12h14"/><path d="M12 5v14"/>'
  }, {
    id: 'minus',
    svgContent: '<path d="M5 12h14"/>'
  }]
}
