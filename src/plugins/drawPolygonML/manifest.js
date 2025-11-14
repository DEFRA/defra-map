// src/plugins/drawPolygonML/manifest.js
import './drawPolygon.scss'
import { Check, Undo, Magnet } from 'lucide-react'
import { initialState, actions } from './reducer.js'
import { DrawPolygonInit } from './DrawPolygonInit.jsx'

const createButtonSlots = (showLabel) => ({
  mobile:  { slot: 'actions', showLabel },
  tablet:  { slot: 'actions', showLabel },
  desktop: { slot: 'actions', showLabel }
})

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
    ...createButtonSlots(true)
  },{
    id: 'drawPolygonAddPoint',
    label: 'Add point',
    variant: 'primary',
    hiddenWhen: ({ appState, pluginState }) => pluginState.mode !== 'draw_vertex' || appState.interfaceType === 'mouse',
    ...createButtonSlots(true)
  },{
    id: 'drawPolygonUndo',
    label: 'Undo',
    iconId: 'undo',
    variant: 'tertiary',
    enableWhen: ({ pluginState }) => pluginState.numVertecies >= 1,
    ...createButtonSlots(false)
  },{
    id: 'drawPolygonFinish',
    label: 'Close shape',
    iconId: 'check',
    variant: 'tertiary',
    hiddenWhen: ({ pluginState }) => pluginState.mode !== 'draw_vertex',
    enableWhen: ({ pluginState }) => pluginState.numVertecies > 3,
    ...createButtonSlots(false)
  },{
    id: 'drawPolygonDeletePoint',
    label: 'Delete point',
    iconId: 'close',
    variant: 'tertiary',
    enableWhen: ({ pluginState }) => pluginState.selectedVertexIndex >= 0 && pluginState.numVertecies > 3,
    hiddenWhen: ({ pluginState }) => !(['simple_select', 'edit_vertex'].includes(pluginState.mode)),
    ...createButtonSlots(false)
  },{
    id: 'drawPolygonSnap',
    label: 'Snap to point',
    iconId: 'magnet',
    variant: 'tertiary',
    ...createButtonSlots(false)
  },{
    id: 'drawPolygonCancel',
    label: 'Cancel',
    variant: 'tertiary',
    hiddenWhen: ({ appState }) => !appState.isFullscreen,
    ...createButtonSlots(true)
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