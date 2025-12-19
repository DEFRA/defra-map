// /plugins/data-layers-ml/manifest.js
import { initialState, actions } from './reducer.js'
import { DataLayersInit } from './DataLayersInit.jsx'
import { DataLayers } from './DataLayers.jsx'

console.log('Here')
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
    render: DataLayers
  }],

  buttons: [{
    id: 'dataLayers',
    label: 'Layers',
    panelId: 'dataLayers',
    iconId: 'layers',
    excludeWhen: ({ pluginConfig }) => !pluginConfig.layers.find(l => l.showInLegend),
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
  }]
}
