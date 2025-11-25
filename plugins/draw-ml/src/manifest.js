// /plugins/draw-ml/manifest.js
import { Check, Undo, Magnet } from 'lucide-react'
import { initialState, actions } from './reducer.js'
import { DrawInit } from './DrawInit.jsx'
import { newPolygon } from './api/newPolygon.js'
import { editFeature } from './api/editFeature.js'

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

  InitComponent: DrawInit,

  buttons: [{
    id: 'drawDone',
    label: 'Done',
    variant: 'primary',
    hiddenWhen: ({ appState, pluginState }) => !(['simple_select', 'edit_vertex'].includes(pluginState.mode) || appState.interfaceType !== 'keyboard'),
    enableWhen: ({ pluginState }) => !!pluginState.feature,
    ...createButtonSlots(true)
  },{
    id: 'drawAddPoint',
    label: 'Add point',
    variant: 'primary',
    hiddenWhen: ({ appState, pluginState }) => pluginState.mode !== 'draw_vertex' || appState.interfaceType === 'mouse',
    ...createButtonSlots(true)
  },{
    id: 'drawUndo',
    label: 'Undo',
    iconId: 'undo',
    variant: 'tertiary',
    enableWhen: ({ pluginState }) => pluginState.numVertecies >= 1,
    ...createButtonSlots(false)
  },{
    id: 'drawFinish',
    label: 'Close shape',
    iconId: 'check',
    variant: 'tertiary',
    hiddenWhen: ({ pluginState }) => pluginState.mode !== 'draw_vertex',
    enableWhen: ({ pluginState }) => pluginState.numVertecies > 3,
    ...createButtonSlots(false)
  },{
    id: 'drawDeletePoint',
    label: 'Delete point',
    iconId: 'close',
    variant: 'tertiary',
    enableWhen: ({ pluginState }) => pluginState.selectedVertexIndex >= 0 && pluginState.numVertecies > 3,
    hiddenWhen: ({ pluginState }) => !(['simple_select', 'edit_vertex'].includes(pluginState.mode)),
    ...createButtonSlots(false)
  },{
    id: 'drawSnap',
    label: 'Snap to point',
    iconId: 'magnet',
    variant: 'tertiary',
    pressedWhen: ({ pluginState }) => pluginState.snap,
    ...createButtonSlots(false)
  },{
    id: 'drawCancel',
    label: 'Cancel',
    variant: 'tertiary',
    hiddenWhen: ({ appState }) => !appState.isFullscreen,
    ...createButtonSlots(true)
  }],

  keyboardShortcuts: [{
    id: 'drawStart',
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
  }],

  api: {
    newPolygon,
    editFeature
  }
}