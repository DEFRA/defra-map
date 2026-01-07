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

export const tools = [
  {
    id: 'edit',
    name: 'Edit',
    svg: '<path d="M11.298 4.666l3.536 3.536-7.071 7.071-3.536-3.536 7.071-7.071zm2.475-2.475a1.5 1.5 0 0 1 2.121 0l1.415 1.415a1.5 1.5 0 0 1 0 2.121l-1.768 1.768-3.536-3.536 1.768-1.768zM3.52 12.444l3.536 3.536-5.304 1.768 1.768-5.304z"/>'
  },
  {
    id: 'delete',
    name: 'Delete',
    svg: '<path d="M3 5.963H2V3.989h4V2h8v1.989h4v1.974h-.956V18H3V5.963zm12 0H5.044v10.063H15V5.963zm-8.547 1.04l1-.006.047 8-1 .006-.047-8zm3.024 0l1-.006.046 8-1 .006-.046-8zm3 0l1-.006.046 8-1 .006-.046-8z"/>'
  }
]

export const drawTools = [
  {
    id: 'square',
    name: 'Square',
    drawMode: 'frame',
    svg: '<path d="M18.002 18H2.001V2h16.001v16zM16.001 4H4.002v12h11.999V4z"/>'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    drawMode: 'vertex',
    svg: '<path d="M2.98 6h-.919V2H5.98v1h8.041V2h3.919v4h-.96v7.996h.96v4h-3.919V17H5.98v1H2.061v-4h.919V6zm3-1v1h-1v8h1v1h8.041v-1.004h.959V6h-.959V5H5.98z"/>'
  }
]
