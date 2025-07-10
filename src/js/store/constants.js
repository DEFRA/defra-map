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
  SET_BANNER: 'setbanner',
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
  ZOOM: 12,
  STYLES: ['default', 'dark', 'aerial', 'deuteranopia', 'tritanopia'],
  MAX_BOUNDS_4326: [-7.57216793459, 49.959999905, 1.68153079591, 58.6350001085],
  MAX_BOUNDS_27700: [167161, 13123, 670003, 663805]
}

export const labels = {
  legend: {
    TITLE: 'Key',
    SVG: '<path d="M9.125 5V3h9v2h-9zm0 6V9h9v2h-9zm0 6v-2h9v2h-9zm-3-9v4h-4V8h4zm0-6v4h-4V2h4zm0 12v4h-4v-4h4z" fill="currentColor" />'
  },
  layers: {
    TITLE: 'Layers',
    SVG: '<path d="M10 1l10 7-10 7L0 8l10-7zm0 2.441L3.488 8 10 12.559 16.512 8 10 3.441zm8.256 7.338L20 12l-10 7-10-7 1.744-1.221L10 16.559l8.256-5.78z" fill="currentColor"/>'
  },
  menu: {
    TITLE: 'Menu',
    SVG: '<circle cx="10" cy="10" r="8.5" stroke-width="1.5" fill="none" stroke="currentColor"/><path d="M5.976 8.494l4.013 4.012 4.035-4.035" stroke-width="2" stroke-linejoin="miter" stroke-miterlimit="10" fill="none" stroke="currentColor"/>'
  }
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
    id: 'circle',
    name: 'Circle',
    drawMode: 'frame',
    svg: '<circle cx="10" cy="10" r="8" stroke-width="2" fill="none" stroke="currentColor"/>'
  },
  {
    id: 'line',
    name: 'Line',
    drawMode: 'vertex',
    svg: '<path d="M5.979 15.455V18H2.06v-4h2.546l9.414-9.415V2h3.919v4h-2.505l-9.455 9.455z"/>'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    drawMode: 'vertex',
    svg: '<path d="M2.98 6h-.919V2H5.98v1h8.041V2h3.919v4h-.96v7.996h.96v4h-3.919V17H5.98v1H2.061v-4h.919V6zm3-1v1h-1v8h1v1h8.041v-1.004h.959V6h-.959V5H5.98z"/>'
  },
  {
    id: 'point',
    name: 'Point',
    drawMode: 'frame',
    svg: '<path d="M11.322 4.762l.323-2.282 1.306-1.305 5.874 5.874-1.305 1.306-2.282.323-2.611 2.611.977 3.593-1.306 1.305-8.485-8.485 1.305-1.306 3.593.977 2.611-2.611zm-2.91 8.953L.277 19.723l6.014-8.129 2.121 2.121z"/>'
  }
]
