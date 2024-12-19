import { FloodMap } from '../../src/flood-map.js'
import { getInterceptors, getRequest, getEsriToken } from './request.js'

let map, isDark, isRamp

const vtLayers = [
  { n: 'Flood_Zone_2_3_Rivers_and_Sea', s: '_N', v: '_VTP2', m: '_Model_Origin_Layer', q: 'fz' },
  { n: 'Surface_water_spatial_planning_1in30', s: '_depth_N', v: '_depth_VTP_2', m: '_depth_Model_Origin_Layer_gdb', q: 'swhr' }, // q: 'swpdhr'
  { n: 'Surface_water_spatial_planning_1in100', s: '_depth_N', v: '_depth', m: '_depth_Model_Origin_Layer_gdb2', q: 'swmr' }, // q: 'swpdmr'
  { n: 'Surface_water_spatial_planning_1in1000', s: '_depth_N', v: '_depth_VTP', m: '_depth_Model_Origin_Layer_gdb', q: 'swlr' }, // q: 'swpdlr'
  { n: 'Rivers_1in30_Sea_1in30_defended_depth', s: '_N', v: '', m: '_Model_Origin_Layer', q: 'rsdpdhr' },
  { n: 'Rivers_1in100_Sea_1in200_defended_depth', s: '_N', v: '_VTP', m: '_Model_Origin_Layer', q: 'rsdpdmr' },
  { n: 'Rivers_1in1000_Sea_1in1000_defended_depth', s: '_N', v: '_VTP_22', m: '_Model_Origin_Layer_gdb', q: 'rsdpdlr' },
  { n: 'Rivers_1in100_Sea_1in200_undefended_depth', s: '_N', v: '_VTP', m: '_Model_Origin_Layer_gdb', q: 'rsupdmr' },
  { n: 'Rivers_1in1000_Sea_1in1000_undefended_depth', s: '_N', v: '_VTP', m: '_Model_Origin_Layer_gdb', q: 'rsupdlr' },
  // { n: 'Surface_water_spatial_planning_1in30_depth_CCP1', s: '_N', v: '_VTP', m: null, q: 'swclhr' },
  // { n: 'Surface_water_spatial_planning_1in100_depth_CCP1', s: '_N', v: '_VTP', m: null, q: 'swclmr' },
  // { n: 'Surface_water_spatial_planning_1in1000_depth_CCP1', s: '_N', v: '_VTP', m: null, q: 'swcllr' },
  { n: 'Rivers_1in30_Sea_1in30_defended_depth_CCP1', s: '_N', v: '_VTP', m: null, q: 'rsdclhr' },
  { n: 'Rivers_1in100_Sea_1in200_defended_depth_CCP1', s: '_N', v: '_VTP', m: null, q: 'rsdclmr' },
  { n: 'Rivers_1in1000_Sea_1in1000_defended_depth_CCP1', s: '_N', v: '_VTP', m: null, q: 'rsdcllr' },
  { n: 'Rivers_1in100_Sea_1in200_undefended_depth_CCP1', s: '_N', v: '_VTP', m: null, q: 'rsuclmr' },
  { n: 'Rivers_1in1000_Sea_1in1000_undefended_depth_CCP1', s: '_N', v: '', m: null, q: 'rsucllr' }
]

const fLayers = [
  { n: 'nat_defences', q: 'fd' },
  { n: 'nat_fsa', q: 'fsa' }
]

const addLayers = (layers) => {
  return Promise.all([
    import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/VectorTileLayer.js'),
    import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/FeatureLayer.js')
  ]).then(modules => {
    const VectorTileLayer = modules[0].default
    const FeatureLayer = modules[1].default
    vtLayers.forEach((layer, i) => {
      map.add(new VectorTileLayer({
        id: layer.n,
        style: {
          version: 8,
          sources: {
            esri: {
              type: 'vector',
              minzoom: 4,
              maxzoom: 16,
              scheme: 'xyz',
              url: `https://tiles.arcgis.com/tiles/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/${layer.n + layer.v}/VectorTileServer`
            }
          },
          layers: Array(i === 0 ? 2 : 7).fill(0).map((_, j) => {
            return {
              id: layer.n + j,
              type: 'fill',
              source: 'esri',
              'source-layer': `${layer.n + layer.s}`,
              minzoom: 4.7597,
              filter: ['==', '_symbol', j],
              layout: {
                visibility: 'visible' // i === 0 ? getFloodZoneVisibility(layers) : 'visible'
              },
              paint: {
                'fill-color': i === 0 ? fillFloodZones(j) : fillModel(j),
                'fill-opacity': 0.75
              }
            }
          })
        },
        visible: false
      }))
    })
    fLayers.forEach(layer => {
      map.add(new FeatureLayer({
        id: layer.n,
        url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/${layer.n}/FeatureServer`,
        renderer: layer.n === 'nat_defences' ? renderFloodDefence() : renderFloodStorage(),
        visible: false
      }))
    })
  })
}

const fillModel = (band) => {
  const light = '#2b8cbe'
  const dark = '#00ff00'
  const depthLight = ['#08589e', '#2b8cbe', '#4eb3d3', '#7bccc4', '#a8ddb5', '#ccebc5', '#f0f9e8'] // light tones > 2300 to < 150
  const depthDark = ['#08589e', '#2b8cbe', '#4eb3d3', '#7bccc4', '#a8ddb5', '#ccebc5', '#f0f9e8'] // dark tones > 2300 to < 150
  return isRamp ? isDark ? depthDark[band] : depthLight[band] : isDark ? dark : light
}

const fillFloodZones = (zone) => {
  const light = ['#1d70b8', '#003078'] // light tones Zone 2, Zone 3
  const dark = ['#b58840', '#6f72af'] // dark tones Zone 2, Zone 3
  return isDark ? dark[zone] : light[zone]
}

const renderFloodDefence = () => {
  return {
    type: 'simple',
    symbol: {
      type: 'simple-line',
      width: '2px',
      color: '#f47738'
    }
  }
}

const renderFloodStorage = () => {
  return {
    type: 'simple',
    symbol: {
      type: 'simple-fill',
      style: 'diagonal-cross',
      color: '#d4351c',
      outline: {
        color: '#d4351c',
        width: 1
      }
    }
  }
}

// const getFloodZoneVisibility = (layers) => {
//   const isVisible = layers.includes('fz23')
//   return isVisible ? 'visible' : 'none'
// }

const toggleVisibility = (type, mode, segments, layers) => {
  // Conditionally add/remove layers might offer better for performance
  const isDrawMode = ['frame', 'draw'].includes(mode)
  vtLayers.forEach((l, i) => {
    const id = l.n
    const layer = map.findLayerById(id)
    // const isVisibleLyr = vtLayers[i].q === 'fz' || ['fe', 'md'].some(l => layers.includes(l))
    // const isVisible = !isDrawMode && isVisibleLyr && segments.join('') === vtLayers[i].q
    const isVisible = !isDrawMode && segments.join('') === vtLayers[i].q
    const isModeChange = type === 'mode'
    layer.visible = isVisible
    Array(i === 0 ? 2 : 7).fill(0).forEach((_, j) => {
      const paintProperties = layer.getPaintProperties(id + j)
      if (paintProperties && isVisible && !isModeChange) {
        paintProperties['fill-color'] = i === 0 ? fillFloodZones(j) : fillModel(j)
        layer.setPaintProperties(id + j, paintProperties)
        // if (i !== 0) return
        // Flood zones visiblity
        // const visibility = getFloodZoneVisibility(layers)
        // layer.setLayoutProperties(id + j, { visibility })
      }
    })
  })
  fLayers.forEach(l => {
    const layer = map.findLayerById(l.n)
    const isVisible = !isDrawMode && layers.includes(l.q)
    layer.visible = isVisible
    // Re-colour feature layers
  })
}

const getSymbols = () => {
  return ['water-storage', 'flood-defence'].map(s => `/assets/images/symbols/${s}.svg`)
}

const symbols = getSymbols()

const depthMap = ['over 2.3', '2.3', '1.2', '0.9', '0.6', '0.3', '0.15']

const fm = new FloodMap('map', {
  framework: 'esri',
  type: 'inline',
  place: 'Ambleside',
  zoom: 16,
  minZoom: 7,
  maxZoom: 20,
  centre: [324973, 536891],
  maxExtent: [167161, 13123, 670003, 663805],
  height: '100%',
  hasGeoLocation: true,
  symbols,
  requestCallback: getRequest,
  // hasAutoMode: true,
  // deviceTestCallback: () => true,
  // geocodeProvider: 'esri-world-geocoder',
  styles: {
    attribution: `${String.fromCharCode(169)} Crown copyright and database rights ${(new Date()).getFullYear()} OS AB0123456789`,
    tokenCallback: getEsriToken,
    interceptorsCallback: getInterceptors,
    defaultUrl: process.env.OS_VTAPI_DEFAULT_URL,
    darkUrl: process.env.OS_VTAPI_DARK_URL
  },
  search: {
    country: 'england',
    isAutocomplete: true
  },
  legend: {
    width: '280px',
    // display: 'compact',
    isVisible: true,
    title: 'Menu',
    keyWidth: '360px',
    keyDisplay: 'min',
    segments: [
      {
        heading: 'Datasets',
        collapse: 'collapse',
        items: [
          {
            id: 'fz',
            label: 'Flood zones 2 and 3'
          },
          {
            id: 'rsd',
            label: 'River and sea with defences'
          },
          {
            id: 'rsu',
            label: 'River and sea without defences'
          },
          {
            id: 'sw',
            label: 'Surface water'
          },
          {
            id: 'mo',
            label: 'None'
          }
        ]
      },
      {
        id: 'tf',
        heading: 'Time frame',
        collapse: 'collapse',
        // parentIds: ['rsd', 'rsu', 'sw'],
        parentIds: ['rsd', 'rsu'],
        items: [
          {
            id: 'pd',
            label: 'Present day'
          },
          {
            id: 'cl',
            label: '2040\'s to 2060\'s'
          }
        ]
      },
      {
        id: 'af1',
        heading: 'Annual likelihood of flooding',
        collapse: 'collapse',
        parentIds: ['rsd', 'sw'],
        items: [
          {
            id: 'hr',
            label: 'Above 3.3%'
          },
          {
            id: 'mr',
            label: '0.1% to 0.5%'
          },
          {
            id: 'lr',
            label: 'Below 0.1%'
          }
        ]
      },
      {
        id: 'af2',
        heading: 'Annual likelihood of flooding',
        collapse: 'collapse',
        parentIds: ['rsu'],
        items: [
          {
            id: 'mr',
            label: '0.1% to 0.5%'
          },
          {
            id: 'lr',
            label: 'below 0.1%'
          }
        ]
      }
    ],
    key: [
      // {
      //   heading: 'Flood extent and depth',
      //   parentIds: ['pd', 'cl'],
      //   collapse: 'collapse',
      //   type: 'radio',
      //   items: [
      //     {
      //       id: 'na',
      //       label: 'Hidden'
      //     },
      //     {
      //       id: 'fe',
      //       label: 'Flood extent',
      //       fill: 'default: #ff0000, dark: #00ff00',
      //       isSelected: true
      //     },
      //     {
      //       id: 'md',
      //       label: 'Maximum depth in metres',
      //       display: 'ramp',
      //       numLabels: 3,
      //       items: [
      //         {
      //           label: 'above 2.3',
      //           fill: 'default: #08589e, dark: #00ff00'
      //         },
      //         {
      //           label: '2.3',
      //           fill: '#2b8cbe'
      //         },
      //         {
      //           label: '1.2',
      //           fill: '#4eb3d3'
      //         },
      //         {
      //           label: '0.9',
      //           fill: '#7bccc4'
      //         },
      //         {
      //           label: '0.6',
      //           fill: '#a8ddb5'
      //         },
      //         {
      //           label: '0.3',
      //           fill: '#ccebc5'
      //         },
      //         {
      //           label: '0.15',
      //           fill: '#f0f9e8'
      //         }
      //       ]
      //     }
      //   ]
      // },
      // {
      //   heading: 'Map features',
      //   parentIds: ['fz'],
      //   collapse: 'collapse',
      //   items: [
      //     {
      //       id: 'fz23',
      //       label: 'Flood zones',
      //       isSelected: true,
      //       items: [
      //         {
      //           label: 'Flood zone 1',
      //           fill: '#00A4CD'
      //         },
      //         {
      //           label: 'Flood zone 2',
      //           fill: '#003078'
      //         }
      //       ]
      //     },
      //     {
      //       id: 'fsa',
      //       label: 'Water storage',
      //       icon: symbols[0],
      //       fill: 'default: #d4351c, dark: #00703c'
      //     },
      //     {
      //       id: 'fd',
      //       label: 'Flood defence',
      //       icon: symbols[1],
      //       fill: '	#f47738'
      //     }
      //   ]
      // },
      // {
      //   heading: 'Map features',
      //   parentIds: ['pd', 'cl'],
      //   collapse: 'collapse',
      //   items: [
      //     {
      //       id: 'fsa',
      //       label: 'Water storage',
      //       icon: symbols[0],
      //       fill: 'default: #d4351c, dark: #00703c'
      //     },
      //     {
      //       id: 'fd',
      //       label: 'Flood defence',
      //       icon: symbols[1],
      //       fill: '	#f47738'
      //     }
      //   ]
      // },
      {
        heading: 'Map features',
        parentIds: ['fz'],
        collapse: 'collapse',
        items: [
          {
            label: 'Flood zone 1',
            fill: '#00A4CD'
          },
          {
            label: 'Flood zone 2',
            fill: '#003078'
          },
          {
            id: 'fsa',
            label: 'Water storage',
            icon: symbols[0],
            fill: 'default: #d4351c, dark: #00703c'
          },
          {
            id: 'fd',
            label: 'Flood defence',
            icon: symbols[1],
            fill: '	#f47738'
          }
        ]
      },
      {
        heading: 'Map features',
        parentIds: ['rsd', 'rsu', 'sw'],
        collapse: 'collapse',
        items: [
          {
            // id: 'fz1',
            label: 'Flood extent',
            fill: 'default: #ff0000, dark: #00ff00'
          },
          {
            id: 'fsa',
            label: 'Water storage',
            icon: symbols[0],
            fill: 'default: #d4351c, dark: #00703c'
          },
          {
            id: 'fd',
            label: 'Flood defence',
            icon: symbols[1],
            fill: '	#f47738'
          }
        ]
      },
      {
        heading: 'Map features',
        parentIds: ['mo'],
        collapse: 'collapse',
        items: [
          {
            id: 'fsa',
            label: 'Water storage',
            icon: symbols[0],
            fill: 'default: #d4351c, dark: #00703c'
          },
          {
            id: 'fd',
            label: 'Flood defence',
            icon: symbols[1],
            fill: '	#f47738'
          }
        ]
      }
    ]
  },
  // info: {
  //     coord: [325141, 536763],
  //     hasData: true,
  //     width: '360px',
  //     label: '[dynamic title]',
  //     html: '<p class="govuk-body-s">[dynamic body]</p>'
  // },
  queryPolygon: {
    heading: 'Site boundary',
    submitLabel: 'Get site report',
    helpLabel: 'How to draw a shape',
    keyLabel: 'Report area',
    html: '<p class="govuk-body-s">Instructions</p>',
    defaultUrl: process.env.OS_VTAPI_DEFAULT_DRAW_URL,
    darkUrl: process.env.OS_VTAPI_DARK_DRAW_URL,
    minZoom: 12,
    maxZoom: 21
    // feature: {type: 'feature', geometry: {type: 'polygon', coordinates: [[[324667,537194],[325298,537194],[325298,536563],[324667,536563],[324667, 537194]]]}}
  },
  queryPixel: vtLayers.map(l => l.n)
})

// Component is ready and we have access to map
// We can listen for map events now, such as 'loaded'
fm.addEventListener('ready', e => {
  map = fm.map
  const { mode, basemap, segments, layers } = e.detail
  isDark = basemap === 'dark'
  isRamp = layers.includes('md')
  addLayers(layers).then(() => {
    toggleVisibility(null, mode, segments, layers)
  })
})

// Listen for actions
fm.addEventListener('action', e => {
  console.log(e.detail)
})

// Listen for mode, segments, layers or style changes
fm.addEventListener('change', e => {
  const { type, mode, basemap, segments, layers } = e.detail
  if (['layer', 'segment'].includes(type)) {
    fm.info = null
  }
  isDark = basemap === 'dark'
  isRamp = layers.includes('md')
  toggleVisibility(type, mode, segments, layers)
})

// Listen to map queries
fm.addEventListener('query', e => {
  if (e.detail.resultType === 'pixel') {
    const { coord, features } = e.detail
    const feature = features.isPixelFeaturesAtPixel ? features.items[0] : null

    if (!feature) {
      fm.info = {
        width: '360px',
        label: 'Title',
        html: `
                  <p class="govuk-body-s">No feature info</p>
              `
      }
      return
    }

    const name = feature.layer.split('_VTP')[0]
    const layer = vtLayers.find(l => l.n === name)

    Promise.all([
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/FeatureLayer.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Point.js')
    ]).then(modules => {
      const FeatureLayer = modules[0].default
      const Point = modules[1].default
      Promise.resolve({ FeatureLayer, Point })
    }).then((FeatureLayer, Point) => layer.m ? () => {
      const model = new FeatureLayer({
        url: `https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/${layer.n + layer.m}/FeatureServer`
      })
      model.queryFeatures({
        geometry: new Point({ x: coord[0], y: coord[1], spatialReference: 27700 }),
        outFields: ['*'],
        spatialRelationship: 'intersects',
        distance: 1,
        units: 'meters',
        returnGeometry: false
      }).then(results => {
        if (results.features.length) {
          Promise.resolve(results.features[0].attributes)
        } else {
          Promise.resolve(null)
        }
      })
    } : Promise.resolve()).finally(attributes => {
      const band = feature._symbol
      const layerName = feature.layer
      const isFloodZone = layerName.includes('Zone')
      const title = isFloodZone
        ? `<strong>Flood zone</strong>: ${band + 2}<br>`
        : `<strong>Maximum depth:</strong> ${depthMap[band]}metres<br/>`
      const model = attributes
        ? `
            <strong>Model:</strong> ${attributes.model}</br/>
            <strong>Model year:</strong> ${attributes.model_year}
        `
        : ''
      fm.info = {
        width: '360px',
        label: 'Title',
        html: `
          <p class="govuk-body-s">${title}${model}</p>
          <p class="govuk-body-s govuk-!-margin-top-1">${layerName}</p>
        `
      }
    })
  }
})