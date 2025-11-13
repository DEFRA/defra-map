// src/plugins/drawPolygonML/manifest.js
import './drawPolygon.scss'
import { Check, Undo, Magnet } from 'lucide-react'
import { initialState, actions } from './reducer.js'
import { DrawPolygonInit } from './DrawPolygonInit.jsx'

const buttonSlotsDefault = {
  mobile:  { slot: 'actions-bottom', showLabel: false },
  tablet:  { slot: 'actions-inset',  showLabel: false },
  desktop: { slot: 'actions-inset',  showLabel: false }
}

const buttonSlotsLabels = {
  mobile:  { ...buttonSlotsDefault.mobile,  showLabel: true },
  tablet:  { ...buttonSlotsDefault.tablet,  showLabel: true },
  desktop: { ...buttonSlotsDefault.desktop, showLabel: true }
}

export const manifest = {
  reducer: {
    initialState,
    actions
  },

  InitComponent: DrawPolygonInit,

  buttons: [{
    id: 'drawPolygonDone',
    label: 'Done',
    variant: 'primary',
    hiddenWhen: ({ appState, pluginState }) => !(['simple_select', 'edit_vertex'].includes(pluginState.mode) || appState.interfaceType === 'mouse'),
    enableWhen: ({ pluginState }) => pluginState.featureGeoJSON,
    ...buttonSlotsLabels
  },{
    id: 'drawPolygonAddPoint',
    label: 'Add point',
    variant: 'primary',
    hiddenWhen: ({ appState, pluginState }) => pluginState.mode !== 'draw_vertex' || appState.interfaceType === 'mouse',
    ...buttonSlotsLabels
  },{
    id: 'drawPolygonUndo',
    label: 'Undo',
    iconId: 'undo',
    variant: 'tertiary',
    enableWhen: ({ pluginState }) => pluginState.numVertecies >= 1,
    ...buttonSlotsDefault
  },{
    id: 'drawPolygonFinish',
    label: 'Close shape',
    iconId: 'check',
    variant: 'tertiary',
    hiddenWhen: ({ pluginState }) => pluginState.mode !== 'draw_vertex',
    enableWhen: ({ pluginState }) => pluginState.numVertecies > 3,
    ...buttonSlotsDefault
  },{
    id: 'drawPolygonDeletePoint',
    label: 'Delete point',
    iconId: 'close',
    variant: 'tertiary',
    enableWhen: ({ pluginState }) => pluginState.selectedVertexIndex >= 0 && pluginState.numVertecies > 3,
    hiddenWhen: ({ pluginState }) => !(['simple_select', 'edit_vertex'].includes(pluginState.mode)),
    ...buttonSlotsDefault
  },{
    id: 'drawPolygonSnap',
    label: 'Snap to point',
    iconId: 'magnet',
    variant: 'tertiary',
    ...buttonSlotsDefault
  },{
    id: 'drawPolygonCancel',
    label: 'Cancel',
    variant: 'tertiary',
    hiddenWhen: ({ appState }) => !appState.isFullscreen,
    ...buttonSlotsLabels
  }],

  keyboardShortcuts: [{
    id: 'drawPolygonStart',
    group: 'Drawing',
    title: 'Edit vertex',
    command: '<kbd>Spacebar</kbd></dd>'
  }],

  icons: [{
    id: 'check',
    component: Check
  },{
    id: 'undo',
    component: Undo
  },{
    id: 'magnet',
    component: Magnet
  }]
}