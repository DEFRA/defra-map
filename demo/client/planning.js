import { FloodMap } from '../../src/flood-map.js'
import { setEsriConfig, getRequest } from './request.js'

let map, isDark, isRamp

const vtLayers = [
  { n: 'Flood_Zones_2_and_3_Rivers_and_Sea', s: 'Flood Zones 2 and 3 Rivers and Sea', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer', q: 'fz' },
  { n: 'Risk_of_Flooding_from_Surface_Water_High', s: 'Risk of Flooding from Surface Water Depth', v: '_NON_PRODUCTION', m: '_depth_Model_Origin_Layer_gdb', q: 'swhr' }, // q: 'swpdhr'
  { n: 'Risk_of_Flooding_from_Surface_Water_Medium', s: 'Risk of Flooding from Surface Water Depth', v: '_NON_PRODUCTION', m: '_depth_Model_Origin_Layer_gdb2', q: 'swmr' }, // q: 'swpdmr'
  { n: 'Risk_of_Flooding_from_Surface_Water_Low', s: 'Risk of Flooding from Surface Water Depth', v: '_NON_PRODUCTION', m: '_depth_Model_Origin_Layer_gdb', q: 'swlr' }, // q: 'swpdlr'
  { n: 'Rivers_1_in_30_Sea_1_in_30_Defended_Depth', s: 'Rivers 1 in 30 Sea 1 in 30 Defended Depth', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer', q: 'rsdpdhr' },
  { n: 'Rivers_1_in_100_Sea_1_in_200_Defended_Depth', s: 'Rivers 1 in 100 Sea 1 in 200 Defended Depth', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer', q: 'rsdpdmr' },
  { n: 'Rivers_1_in_1000_Sea_1_in_1000_Defended_Depth', s: 'Rivers 1 in 1000 Sea 1 in 1000 Defended Depth', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer_gdb', q: 'rsdpdlr' },
  { n: 'Rivers_1_in_100_Sea_1_in_200_Undefended_Depth', s: 'Rivers 1 in 100 Sea 1 in 200 Undefended Depth', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer_gdb', q: 'rsupdmr' },
  { n: 'Rivers_1_in_1000_Sea_1_in_1000_Undefended_Depth', s: 'Rivers 1 in 1000 Sea 1 in 1000 Undefended Depth', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer_gdb', q: 'rsupdlr' },
  { n: 'Rivers_1_in_30_Sea_1_in_30_Defended_Depth_CCP1', s: 'Rivers 1 in 30 Sea 1 in 30 Defended Depth CCP1', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer', q: 'rsdclhr' },
  { n: 'Rivers_1_in_100_Sea_1_in_200_Defended_Depth_CCP1', s: 'Rivers 1 in 100 Sea 1 in 200 Defended Depth CCP1', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer', q: 'rsdclmr' },
  { n: 'Rivers_1_in_1000_Sea_1_in_1000_Defended_Depth_CCP1', s: 'Rivers 1 in 1000 Sea 1 in 1000 Defended Depth CCP1', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer_gdb', q: 'rsdcllr' },
  { n: 'Rivers_1_in_100_Sea_1_in_200_Undefended_Depth_CCP1', s: 'Rivers 1 in 100 Sea 1 in 200 Undefended Depth CCP1', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer_gdb', q: 'rsuclmr' },
  { n: 'Rivers_1_in_1000_Sea_1_in_1000_Undefended_Depth_CCP1', s: 'Rivers 1 in 1000 Sea 1 in 1000 Undefended Depth CCP1', v: '_NON_PRODUCTION', m: '_Model_Origin_Layer_gdb', q: 'rsucllr' },
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
    const bands = [0, 200, 300, 600, 900, 1200]
    vtLayers.forEach((layer, i) => {
      map.add(new VectorTileLayer({
        id: layer.n,
        opacity: 0.75,
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
          layers: Array(i === 0 ? 2 : 6).fill(0).map((_, j) => {
            return {
              id: layer.n + j,
              type: 'fill',
              source: 'esri',
              'source-layer': i >= 1 && i <= 3 ? `${layer.s} \u003E ${bands[j]}mm` : layer.s,
              minzoom: 4.7597,
              ...(i === 0 && { filter: ['==', '_symbol', j] }),
              layout: {
                visibility: 'visible'
              },
              paint: {
                'fill-color': i === 0 ? fillFloodZones(j) : fillModel(6)
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

const toggleVisibility = (type, drawMode, segments, layers) => {
  // Conditionally add/remove layers might offer better for performance
  const isDrawMode = ['frame', 'vertex'].includes(drawMode)
  vtLayers.forEach((l, i) => {
    const id = l.n
    const layer = map.findLayerById(id)
    // const isVisibleLyr = vtLayers[i].q === 'fz' || ['fe', 'md'].some(l => layers.includes(l))
    // const isVisible = !isDrawMode && isVisibleLyr && segments.join('') === vtLayers[i].q
    const isVisible = !isDrawMode && segments.join('') === vtLayers[i].q
    const isModeChange = type === 'drawMode'
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

const attribution = `<a href="">${String.fromCharCode(169)} Crown copyright and database rights ${(new Date()).getFullYear()} OS AB0123456789</a>. Powered by <a href="https://www.esri.com">ESRI</a>`

const depthMap = ['over 2.3', '2.3', '1.2', '0.9', '0.6', '0.3', '0.15']

const fm = new FloodMap('map', {
  behaviour: 'inline',
  framework: 'esri',
  provider: async () => (await import(/* webpackChunkName: "custom-provider" */ '../../src/js/provider/esri-sdk/provider.js')).default,
  place: 'Ambleside',
  // banner: '<p>Rivers and sea supporting data may show inconsistent results. <a href="">Find out more</a></p>',
  zoom: 16,
  minZoom: 7,
  maxZoom: 20,
  center: [324973, 536891],
  // extent: [338388, 554644, 340881, 557137],
  maxExtent: [167161, 13123, 670003, 663805],
  height: '100%',
  hasGeoLocation: true,
  symbols,
  transformGeocodeRequest: getRequest,
  esriConfigCallback: setEsriConfig,
  // tokenCallback: getEsriToken,
  // interceptorsCallback: getInterceptors,
  // hasAutoMode: true,
  // deviceTestCallback: () => true,
  // geocodeProvider: 'esri-world-geocoder',
  drawTools: ['square', 'circle', 'polygon'],
  backgroundColor: 'default: #f5f5f0, dark: #060606',
  styles: [{
    name: 'default',
    url: process.env.OS_VTAPI_DEFAULT_URL,
    // attribution
  }, {
    name: 'dark',
    url: process.env.OS_VTAPI_DARK_URL,
    attribution: 'Open data, dark style'
  }],
  search: {
    country: 'england',
    isAutocomplete: true,
    errorText: 'No results available. Enter a town or postcode'
  },
  legend: {
    width: '280px',
    // display: 'compact',
    isVisible: true,
    title: 'Menu',
    keyWidth: '360px',
    // keyDisplay: 'min',
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
  queryArea: {
    heading: 'Site boundary',
    submitLabel: 'Get site report',
    helpURL: 'http://www.google.co.uk',
    keyLabel: 'Report area',
    styles: [{
      name: 'default',
      url: process.env.OS_VTAPI_DEFAULT_DRAW_URL,
      attribution
    }, {
      name: 'dark',
      url: process.env.OS_VTAPI_DARK_DRAW_URL,
      attribution
    }],
    minZoom: 12,
    maxZoom: 21,
    // feature: {type: 'feature', geometry: {type: 'polygon', coordinates: [[[324667,537194],[325298,537194],[325298,536563],[324667,536563],[324667, 537194]]]}}
    // feature: {type: 'feature', geometry: { type: 'polygon', coordinates: [[[326542.8,535877.9],[326541.6,535852.5],[326537.8,535827.4],[326531.6,535802.7],[326523.1,535778.8],[326512.2,535755.8],[326499.2,535734],[326484,535713.6],[326466.9,535694.8],[326448.1,535677.7],[326427.7,535662.5],[326405.9,535649.5],[326382.9,535638.6],[326359,535630.1],[326334.3,535623.9],[326309.2,535620.1],[326283.8,535618.9],[326258.4,535620.1],[326233.3,535623.9],[326208.6,535630.1],[326184.7,535638.6],[326161.7,535649.5],[326139.9,535662.5],[326119.5,535677.7],[326100.7,535694.8],[326083.6,535713.6],[326068.4,535734],[326055.4,535755.8],[326044.5,535778.8],[326036,535802.7],[326029.8,535827.4],[326026,535852.5],[326024.8,535877.9],[326026,535903.3],[326029.8,535928.4],[326036,535953.1],[326044.5,535977],[326055.4,536000],[326068.4,536021.8],[326083.6,536042.2],[326100.7,536061],[326119.5,536078.1],[326139.9,536093.3],[326161.7,536106.3],[326184.7,536117.2],[326208.6,536125.7],[326233.3,536131.9],[326258.4,536135.7],[326283.8,536136.9],[326309.2,536135.7],[326334.3,536131.9],[326359,536125.7],[326382.9,536117.2],[326405.9,536106.3],[326427.7,536093.3],[326448.1,536078.1],[326466.9,536061],[326484,536042.2],[326499.2,536021.8],[326512.2,536000],[326523.1,535977],[326531.6,535953.1],[326537.8,535928.4],[326541.6,535903.3],[326542.8,535877.9]]]}}
  },
  queryLocation: {
    layers: vtLayers.map(l => l.n)
  }
})

// Component is ready and we have access to map
// We can listen for map events now, such as 'loaded'
fm.addEventListener('ready', e => {
  map = fm.map
  const { drawMode, style, segments, layers } = e.detail
  isDark = style === 'dark'
  isRamp = layers.includes('md')
  addLayers(layers).then(() => {
    toggleVisibility(null, drawMode, segments, layers)
  })
})

// Listen for actions
fm.addEventListener('action', e => {
  // console.log(e.detail)
})

// Listen for drawMode, segments, layers or style changes
fm.addEventListener('change', e => {
  const { type, drawMode, style, segments, layers } = e.detail
  if (['layer', 'segment'].includes(type)) {
    fm.setInfo(null)
  }
  isDark = style === 'dark'
  isRamp = layers.includes('md')
  toggleVisibility(type, drawMode, segments, layers)
})

// Listen to map queries
fm.addEventListener('query', e => {
  if (e.detail.resultType === 'pixel') {
    const { coord, features } = e.detail
    const feature = features.isPixelFeaturesAtPixel ? features.items[0] : null

    if (!feature) {
      fm.setInfo({
        width: '360px',
        label: 'Title',
        html: `
          <p class="govuk-body-s">No feature info</p>
        `
      })
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
      fm.setInfo({
        width: '360px',
        label: 'Title',
        html: `
          <p class="govuk-body-s">${title}${model}</p>
          <p class="govuk-body-s govuk-!-margin-top-1">${layerName}</p>
        `
      })
    })
  }
})