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
  SET_DRAW: 'setdraw',
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
  GEOCODE_PROVIDER: 'os-open-names',
  STYLES: ['default', 'dark', 'aerial', 'deuteranopia', 'tritanopia'],
  MAX_BOUNDS_4326: [-5.719993, 49.955638, 1.794689, 55.825973],
  MAX_BOUNDS_27700: [167161, 13123, 670003, 663805],
  ZOOM: 12,
  MIN_ZOOM: 6,
  MAX_ZOOM: 16
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

export const constructorOptions = [
  'backgroundColor',
  'basemap',
  'behaviour',
  'bounds',
  'buttonType',
  'center',
  'container',
  'featureLayers',
  'framework',
  'geocodeProvider',
  'handleExit',
  'hasAutoMode',
  'hasGeoLocation',
  'hasReset',
  'height',
  'id',
  'info',
  'interfaceType',
  'legend',
  'maxBounds',
  'maxZoom',
  'minZoom',
  'modules',
  'paddingBox',
  'parent',
  'locationLayers',
  'place',
  'queryFeature',
  'queryLocation',
  'queryArea',
  'requestCallback',
  'search',
  'size',
  'styles',
  'symbols',
  'transformSearchRequest',
  'title',
  'zoom'
]
