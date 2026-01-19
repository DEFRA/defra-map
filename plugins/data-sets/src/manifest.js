// /plugins/data-sets/manifest.js
import { initialState, actions } from './reducer.js'
import { DataSetsInit } from './DataSetsInit.jsx'
import { Layers } from './Layers.jsx'
import { Key } from './Key.jsx'
import { showLayer } from './api/showLayer.js'
import { hideLayer } from './api/hideLayer.js'

export const manifest = {
  InitComponent: DataSetsInit,

  reducer: {
    initialState,
    actions
  },

  panels: [{
    id: 'dataSetsLayers',
    label: 'Layers',
    mobile: {
      slot: 'bottom',
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
    render: Layers
  },{
    id: 'dataSetsKey',
    label: 'Key',
    mobile: {
      slot: 'bottom',
      modal: true
    },
    tablet: {
      slot: 'inset',
      width: '300px'
    },
    desktop: {
      slot: 'inset',
      width: '320px'
    },
    render: Key
  }],

  buttons: [{
    id: 'dataSetsLayers',
    label: 'Layers',
    panelId: 'dataSetsLayers',
    iconId: 'layers',
    excludeWhen: ({ pluginConfig }) => !pluginConfig.layers.find(l => l.toggleVisibility),
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
  },{
    id: 'dataSetsKey',
    label: 'Key',
    panelId: 'dataSetsKey',
    iconId: 'key',
    excludeWhen: ({ pluginConfig }) => !pluginConfig.layers.find(l => l.showInKey),
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
    svgContent: '<path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z"></path><path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845"></path>'
  },{
    id: 'key',
    svgContent: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>'
  }],

  api: {
    showLayer,
    hideLayer
  }
}
