export const events = {
  READY: 'ready',
  CHANGE: 'change',
  QUERY: 'query',
  APP_READY: 'appready',
  APP_CHANGE: 'appchange',
  APP_QUERY: 'appquery',
  SET_SEARCH: 'setsearch',
  SET_INFO: 'setinfo',
  SET_DRAW: 'setdraw',
  SET_SELECTED: 'setselected',
  SET_IS_KEYBOARD: 'setiskeyboard',
  MAP_QUERY: 'mapquery',
  MAP_CLICK: 'mapclick',
  MAP_LOAD: 'load',
  MAP_STYLE: 'style'
}

export const defaults = {
  CONTAINER_TYPE: 'buttonFirst',
  PANEL_POSITION: 'overlayRight'
}

export const settings = {
  breakpoints: {
    MAX_MOBILE: '640px',
    MIN_DESKTOP: '835px'
  },
  container: {
    buttonFirst: {
      CLASS: 'fm-button-first'
    },
    hybrid: {
      CLASS: 'fm-hybrid',
      HEIGHT: '600px'
    },
    inline: {
      CLASS: 'fm-inline',
      HEIGHT: '400px'
    }
  },
  map: {
    BBOX: [
      -5.719993,
      49.955638,
      1.794689,
      55.825973
    ],
    MAX_BBOX: [
      -5.719993,
      49.955638,
      1.794689,
      55.825973
    ],
    CENTRE: [
      -1.4758,
      52.9219
    ],
    ZOOM: 12,
    MIN_ZOOM: 6,
    MAX_ZOOM: 16
  },
  params: {
    view: 'view',
    centreZoom: 'cz',
    segments: 'seg',
    layers: 'lyr',
    featureId: 'id',
    targetMarker: 'qxy'
  }
}

export const offsets = {
  drag: 2,
  pan: {
    ARROWLEFT: [-100, 0],
    ARROWRIGHT: [100, 0],
    ARROWUP: [0, -100],
    ARROWDOWN: [0, 100]
  },
  shiftPan: {
    ARROWLEFT: [-5, 0],
    ARROWRIGHT: [5, 0],
    ARROWUP: [0, -5],
    ARROWDOWN: [0, 5]
  }
}
