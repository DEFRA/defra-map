// src/controls/keyboardShortcuts.js

export const coreShortcuts = [
  {
    id: 'showKeyboardHelp',
    group: 'General',
    title: 'Show keyboard help',
    command: '<kbd>Alt</kbd> + <kbd>K</kbd>',
    enabled: true
  },
  {
    id: 'selectControl',
    group: 'General',
    title: 'Select a map control',
    command: '<kbd>Tab</kbd> or <kbd>Shift</kbd> + <kbd>Tab</kbd>',
    enabled: true
  },
  {
    id: 'moveLarge',
    group: 'Navigation',
    title: 'Move in large steps',
    command: '<kbd>←</kbd>, <kbd>↑</kbd>, <kbd>→</kbd> or <kbd>↓</kbd>',
    enabled: true
  },
  {
    id: 'nudgeMap',
    group: 'Navigation',
    title: 'Nudge map',
    command: '<kbd>Shift</kbd> + <kbd>←</kbd>, <kbd>↑</kbd>, <kbd>→</kbd> or <kbd>↓</kbd>',
    enabled: false
  },
  {
    id: 'zoomLarge',
    group: 'Navigation',
    title: 'Zoom in large steps',
    command: '<kbd>+</kbd> or <kbd>-</kbd>',
    enabled: true
  },
  {
    id: 'nudgeZoom',
    group: 'Navigation',
    title: 'Nudge zoom',
    command: '<kbd>Shift</kbd> + <kbd>+</kbd> or <kbd>-</kbd>',
    enabled: false
  },
  {
    id: 'highlightLabelAtCenter',
    group: 'Labels',
    title: 'Highlight label at centre',
    command: '<kbd>Alt</kbd> + <kbd>Enter</kbd>',
    enabled: false
  },
  {
    id: 'highlightNextLabel',
    group: 'Labels',
    title: 'Highlight nearby label',
    command: '<kbd>Alt</kbd> + <kbd>→</kbd>, <kbd>←</kbd>, <kbd>↑</kbd> or <kbd>↓</kbd>',
    enabled: false
  }
  // {
  //   id: 'cycleFeatures',
  //   group: 'feature',
  //   title: 'Cycle features forward/backward',
  //   command: '<kbd>PageUp</kbd> or <kbd>PageDown</kbd>',
  //   enabled: false
  // },
  // {
  //   id: 'selectFeature',
  //   group: 'feature',
  //   title: 'Select a feature',
  //   command: '<kbd>Enter</kbd> or <kbd>Space</kbd>',
  //   enabled: true
  // },
  // {
  //   id: 'getInfo',
  //   group: 'feature',
  //   title: 'Get info at cursor',
  //   command: '<kbd>Alt</kbd> + <kbd>I</kbd>',
  //   enabled: false
  // },
  // {
  //   id: 'clearSelection',
  //   group: 'feature',
  //   title: 'Clear selection',
  //   command: '<kbd>Esc</kbd>',
  //   enabled: true
  // }
]
