// /plugins/interact/manifest.js
import { InteractInit } from './InteractInit.jsx'
import { initialState, actions } from './reducer.js'
import { selectFeatures } from './api/selectFeatures.js'

export const manifest = {
  InitComponent: InteractInit,

  reducer: {
    initialState,
    actions
  },

  buttons: [{
    id: 'selectDone',
    label: 'Done',
    variant: 'primary',
    enableWhen: ({ mapState, pluginState }) => !!mapState.markers.items.find(m => m.id === 'location') || !!pluginState.selectionBounds,
    mobile: {
      slot: 'actions',
      showLabel: true
    },
    tablet: {
      slot: 'actions',
      showLabel: true
    },
    desktop: {
      slot: 'actions',
      showLabel: true
    }
  },{
    id: 'selectAtTarget',
    label: 'Select',
    variant: 'primary',
    hiddenWhen: ({ appState }) => !['touch', 'keyboard'].includes(appState.interfaceType),
    mobile: {
      slot: 'actions',
      showLabel: true
    },
    tablet: {
      slot: 'actions',
      showLabel: true
    },
    desktop: {
      slot: 'actions',
      showLabel: true
    }
  },{
    id: 'selectCancel',
    label: 'Cancel',
    variant: 'tertiary',
    hiddenWhen: ({ appState}) => !appState.isFullscreen,
    mobile: {
      slot: 'actions',
      showLabel: true
    },
    tablet: {
      slot: 'actions',
      showLabel: true
    },
    desktop: {
      slot: 'actions',
      showLabel: true
    }
  }],

  keyboardShortcuts: [{
    id: 'selectOrMark',
    group: 'Select',
    title: 'Select feature',
    command: '<kbd>Enter</kbd></dd>'
  }],

  api: {
    selectFeatures
  }
}
