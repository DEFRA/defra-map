// /plugins/draw-es/manifest.js
import { initialState, actions } from './reducer.js'
import { DrawInit } from './DrawInit.jsx'
import { newPolygon } from './api/newPolygon.js'
import { editFeature } from './api/editFeature.js'

const buttonSlots = {
  mobile:  { slot: 'actions', showLabel: true },
  tablet:  { slot: 'actions', showLabel: true },
  desktop: { slot: 'actions', showLabel: true }
}

export const manifest = {
  reducer: {
    initialState,
    actions
  },

  InitComponent: DrawInit,

  buttons: [{
    id: 'drawDone',
    label: 'Done',
    variant: 'primary',
    // hiddenWhen: ({ appState, pluginState }) => { console.log(pluginState); return !!pluginState.feature },
    enableWhen: ({ pluginState }) => !!pluginState.feature,
    ...buttonSlots
  },{
    id: 'drawCancel',
    label: 'Cancel',
    variant: 'tertiary',
    // hiddenWhen: ({ appState }) => !appState.isFullscreen,
    ...buttonSlots
  }],

  // keyboardShortcuts: [{
  //   id: 'drawStart',
  //   group: 'Drawing',
  //   title: 'Edit vertex',
  //   command: '<kbd>Spacebar</kbd></dd>'
  // }],

  api: {
    newPolygon,
    editFeature
  }
}