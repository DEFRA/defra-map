const fills = {
  dark: ['#4779C4', '#3C649F', '#2C456B'], 
  aerial: ['#4779C4', '#3C649F', '#2C456B'],
  deuteranopia: ['#79604A', '#297BE1', '#FFB72C'],
  tritanopia: ['#CF2A2B', '#008791', '#FFADB9'],
  default: ['#75D0E9', '#B1E2EE', '#D5EBF2'],
}

export const queryMap = {
  warningsGroup: 'fwg',
  waterGroup: 'wlg',
  outlookDays: 'oud',
  outlookConcern: 'ouc',
  yearlyRamp: 'alr',
  climateGroup: 'clg',
  live: 'li',
  outlook: 'ou',
  yearly: 'ye',
  climate: 'cl',
  day1: 'd1',
  day2: 'd2',
  day3: 'd3',
  day4: 'd4',
  day5: 'd5',
  severe: 'ts',
  warning: 'tw',
  alert: 'ta',
  removed: 'tr',
  river: 'ri',
  sea: 'se',
  groundwater: 'gr',
  rainfall: 'ra'
}

export const addSources = (map) => {
  // map.addSource('warning-polygons', {
  //   type: 'vector',
  //   url: `${process.env.TILE_SERVER_URL}/warning_areas`
  // })
  // map.addSource('warning-centroids', {
  //   type: 'vector',
  //   url: `${process.env.TILE_SERVER_URL}/warning_centroids`
  // })
  map.addSource('station-centroids', {
    type: 'vector',
    url: `${process.env.TILE_SERVER_URL}/station_centroids`
  })
  map.addSource('five-day-forecast', {
    type: 'vector',
    url: `${process.env.TILE_SERVER_URL}/five_day_forecast_areas`
  })
  map.addSource('river-sea', {
    type: 'vector',
    url: `${process.env.TILE_SERVER_URL}/rivers_sea`
  })
  map.addSource('surface-water', {
    type: 'vector',
    url: `${process.env.TILE_SERVER_URL}/ufmfsw_enw_extent_1in30_bv,ufmfsw_enw_extent_1in100_bv,ufmfsw_enw_extent_1in1000_bv`
  })

  // GeoJSON sources
  map.addSource('warning-polygons', {
    type: 'geojson',
    data: process.env.CFF_WARNING_POLYGONS
  })
  map.addSource('warning-centroids', {
    type: 'geojson',
    data: process.env.CFF_WARNING_CENTROIDS
  })
}

export const addLayers = (map, basemap) => {
  const position = map.getLayer('small settlement names')
    ? 'small settlement names'
    : map.getLayer('Road labels')
      ? 'Road labels'
      : null

  map.addLayer({
    id: 'warning-fill',
    type: 'fill',
    source: 'warning-polygons',
    // 'source-layer': 'warning_areas',
    layout: {
      visibility: 'none'
    },
    paint: {
      'fill-color': ['match',
        ['get', 'state'],
        'severe',
        '#8c1419',
        'warning',
        '#e84952',
        'alert',
        '#f2A747',
        '#8297A7'
      ],
      'fill-opacity': 0.75
    },
    minzoom: 12
  }, position)

  map.addLayer({
    id: 'stations',
    type: 'symbol',
    source: 'station-centroids',
    'source-layer': 'station_centroids',
    layout: {
      'icon-image': ['concat', ['get', 'type'], '-', ['get', 'state']],
      'icon-size': 0.5,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'symbol-z-order': 'source',
      'symbol-sort-key': ['match', ['get', 'state'],
        'high', 5,
        'wet', 4,
        'normal', 3,
        'dry', 2,
        1
      ]
    },
    minzoom: 12
  })

  map.addLayer({
    id: 'stations-small',
    type: 'symbol',
    source: 'station-centroids',
    'source-layer': 'station_centroids',
    layout: {
      'icon-image': ['concat', 'station-', ['match', ['get', 'state'],
        'high', 'alert',
        'wet', 'normal',
        'normal', 'normal',
        'dry', 'low',
        'low', 'low',
        'error'
      ]],
      'icon-size': 0.5,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'symbol-z-order': 'source',
      'symbol-sort-key': ['match', ['get', 'state'],
        'high', 5,
        'wet', 4,
        'normal', 3,
        'dry', 2,
        1
      ]
    },
    maxzoom: 12
  })

  map.addLayer({
    id: 'warning-symbol',
    type: 'symbol',
    source: 'warning-centroids',
    // 'source-layer': 'warning_centroids',
    layout: {
      'icon-image': ['get', 'state'],
      'icon-size': 0.5,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'symbol-z-order': 'source',
      'symbol-sort-key': ['match', ['get', 'state'],
        'severe', 4,
        'warning', 3,
        'alert', 2,
        1
      ]
    },
    maxzoom: 12
  })

  map.addLayer({
    id: 'five-day-forecast',
    type: 'fill',
    source: 'five-day-forecast',
    'source-layer': 'five_day_forecast_areas',
    // 'source-layer': 'main.five_day_forecast',
    layout: {
      visibility: 'none'
    },
    paint: {
      // 'fill-color': '#00703c',
      'fill-color': ['match',
        ['get', 'risk_level'],
        4,
        '#d4351c',
        3,
        '#f47738',
        2,
        '#ffdd00',
        '#00703c'
      ],
      'fill-opacity': 0.75
    },
    filter: ['==', 'id', '']
  }, position)

  map.addLayer({
    id: 'river-sea-fill',
    type: 'fill',
    source: 'river-sea',
    'source-layer': 'rivers_sea',
    layout: {
      visibility: 'none'
    },
    paint: {
      'fill-color': ['match',
        ['get', 'prob_4band'],
        'High',
        fills[basemap][0],
        'Medium',
        fills[basemap][1],
        'Low',
        fills[basemap][2],
        'transparent'
      ],
      'fill-opacity': 0.75
    }
  }, position)
  
  map.addLayer({
    id: 'surface-water-1000-fill',
    type: 'fill',
    source: 'surface-water',
    'source-layer': 'ufmfsw_enw_extent_1in1000_bv',
    layout: {
      visibility: 'none'
    },
    paint: {
      'fill-color': fills[basemap][2],
      'fill-opacity': 1
    }
  }, position)

  map.addLayer({
    id: 'surface-water-100-fill',
    type: 'fill',
    source: 'surface-water',
    'source-layer': 'ufmfsw_enw_extent_1in100_bv',
    layout: {
      visibility: 'none'
    },
    paint: {
      'fill-color': fills[basemap][1],
      'fill-opacity': 1
    }
  }, position)
  
  map.addLayer({
    id: 'surface-water-30-fill',
    type: 'fill',
    source: 'surface-water',
    'source-layer': 'ufmfsw_enw_extent_1in30_bv',
    layout: {
      visibility: 'none'
    },
    paint: {
      'fill-color': fills[basemap][0],
      'fill-opacity': 1
    }
  }, position)
}

export const toggleVisibility = (map, detail) => {
  // Set zoom constraints
  map.setMaxZoom(18)
  map.setMinZoom(detail.segments.includes(queryMap.outlook) || detail.segments.includes(queryMap.live) ? 6 : 12)
  map.setMaxZoom(detail.segments.includes(queryMap.outlook) ? 8 : 18)
  // Toggle layers
  map.setLayoutProperty('warning-fill', 'visibility', detail.segments.includes('li') ? 'visible' : 'none')
  map.setLayoutProperty('warning-symbol', 'visibility', detail.segments.includes('li') ? 'visible' : 'none')
  map.setLayoutProperty('stations', 'visibility', detail.segments.includes('li') ? 'visible' : 'none')
  map.setLayoutProperty('stations-small', 'visibility', detail.segments.includes('li') ? 'visible' : 'none')
  map.setLayoutProperty('five-day-forecast', 'visibility', detail.segments.includes('ou') ? 'visible' : 'none')
  map.setLayoutProperty('river-sea-fill', 'visibility', detail.segments.includes('ye') ? 'visible' : 'none')
  map.setLayoutProperty('surface-water-30-fill', 'visibility', detail.segments.includes('ye') ? 'visible' : 'none')
  map.setLayoutProperty('surface-water-100-fill', 'visibility', detail.segments.includes('ye') ? 'visible' : 'none')
  map.setLayoutProperty('surface-water-1000-fill', 'visibility', detail.segments.includes('ye') ? 'visible' : 'none')
  // Filter features
  const layers = (Object.keys(queryMap).filter(k => detail.layers?.includes(queryMap[k])))
  map.setFilter('warning-fill', ['match', ['get', 'state'], layers.length ? layers : '', true, false])
  map.setFilter('warning-symbol', ['match', ['get', 'state'], layers.length ? layers : '', true, false])
  map.setFilter('stations', ['match', ['get', 'type'], layers.length ? layers : '', true, false])
  map.setFilter('stations-small', ['match', ['get', 'type'], layers.length ? layers : '', true, false])
  const day = detail.segments.filter(s => ['d1', 'd2', 'd3', 'd4', 'd5'].includes(s)).map(s => s.charAt(1))[0] || ''
  map.setFilter('five-day-forecast', ['any', ['in', day, ['get', 'days']]])
}

export const toggleSelected = (map, id = '') => {
  map.setFilter('warning-fill-selected', ['==', 'id', id])
  map.setFilter('warning-symbol-selected', ['==', 'id', id])
  map.setFilter('stations-selected', ['==', 'id', id])
  map.setFilter('stations-small-selected', ['==', 'id', id])
}
