// src/core/renderers/slots.js
export const layoutSlots = Object.freeze({
  SIDE: 'side',
  BANNER: 'banner',
  TOP_LEFT: 'top-left',
  TOP_MIDDLE: 'top-middle',
  TOP_RIGHT: 'top-right',
  INSET: 'inset',
  RIGHT_TOP: 'right-top',
  RIGHT_BOTTOM: 'right-bottom',
  MIDDLE: 'middle',
  BOTTOM_RIGHT: 'bottom-right',
  ACTIONS: 'actions',
  DRAWER: 'drawer',
  MODAL: 'modal' // internal only
})

export const allowedSlots = Object.freeze({
  control: [
    layoutSlots.TOP_LEFT,
    layoutSlots.TOP_RIGHT,
    layoutSlots.BOTTOM_RIGHT,
    layoutSlots.ACTIONS_INSET,
    layoutSlots.ACTIONS
  ],
  panel: [
    layoutSlots.SIDE,
    layoutSlots.BANNER,
    layoutSlots.INSET,
    layoutSlots.MIDDLE,
    layoutSlots.ACTIONS_INSET,
    layoutSlots.ACTIONS,
    layoutSlots.DRAWER,
    layoutSlots.MODAL
  ],
  button: [
    layoutSlots.TOP_LEFT,
    layoutSlots.TOP_MIDDLE,
    layoutSlots.TOP_RIGHT,
    layoutSlots.RIGHT_TOP,
    layoutSlots.RIGHT_BOTTOM,
    layoutSlots.ACTIONS_INSET,
    layoutSlots.ACTIONS
  ]
})
