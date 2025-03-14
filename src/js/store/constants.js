export const events = {
  READY: 'ready',
  CHANGE: 'change',
  QUERY: 'query',
  ACTION: 'action',
  APP_READY: 'appready',
  APP_CHANGE: 'appchange',
  APP_QUERY: 'appquery',
  APP_ACTION: 'appaction',
  SET_SEARCH: 'setsearch',
  SET_INFO: 'setinfo',
  SET_SELECTED: 'setselected',
  SET_INTERFACE_TYPE: 'setinterfacetype',
  MAP_QUERY: 'mapquery',
  MAP_CLICK: 'mapclick',
  MAP_LOAD: 'load',
  MAP_STYLE: 'style'
}

export const defaults = {
  CONTAINER_TYPE: 'buttonFirst',
  PANEL_POSITION: 'overlayRight',
  MIN_SEARCH_LENGTH: 3,
  STYLES: ['default', 'dark', 'aerial', 'deuteranopia', 'tritanopia'],
  MAX_BOUNDS_4326: [-5.719993, 49.955638, 1.794689, 55.825973],
  MAX_BOUNDS_27700: [167161, 13123, 670003, 663805]
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
      HEIGHT: '600px'
    }
  },
  params: {
    view: 'view',
    centerZoom: 'cz',
    segments: 'seg',
    layers: 'lyr'
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

export const margin = {
  TOP: 90,
  BOTTOM: 15,
  LEFT: 70
}

export const drawModes = [{
    name: 'Square',
    shape: 'square',
    mode: 'frame',
    path: 'M18.002 18H2.001V2h16.001v16zM16.001 4H4.002v12h11.999V4z'
  }, {
    name: 'Circle',
    shape: 'circle',
    mode: 'frame',
    path: 'M9.999 2c4.415 0 8.001 3.585 8.001 8.001s-3.585 7.999-8.001 7.999S2 14.416 2 10 5.583 2 9.999 2zm0 2C6.688 3.999 4 6.689 4 10s2.688 5.999 5.999 5.999S16 13.311 16 10s-2.69-6.001-6.001-6.001z'
  }, {
    name: 'Polygon',
    shape: 'polygon',
    mode: 'vertex',
    path: 'M2.98 6h-.919V2H5.98v1h8.041V2h3.919v4h-.96v7.996h.96v4h-3.919V17H5.98v1H2.061v-4h.919V6zm3-1v1h-1v8h1v1h8.041v-1.004h.959V6h-.959V5H5.98z'
  }
]