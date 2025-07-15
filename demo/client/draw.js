import { FloodMap } from '../../src/flood-map.js'
import { getRequest, createTileRequest } from './request.js'

const symbols = () => {
  return ['water-storage', 'flood-defence'].map(s => `/assets/images/symbols/${s}.svg`)
}

let map

const fm = new FloodMap('map', {
  behaviour: 'hybrid', // 'buttonFirst | inline',
  place: 'Carlisle',
  zoom: 14,
  minZoom: 8,
  maxZoom: 20,
  // centre: [-2.938769, 54.893806],
  bounds: [-2.989707, 54.864555, -2.878635, 54.937635],
  maxBounds: [-5.719993, 49.955638, 1.794689, 55.825973],
  // hasReset: true,
  hasGeoLocation: true,
  height: '700px',
  // buttonType: 'anchor',
  symbols,
  transformRequest: createTileRequest(() => map),
  transformGeocodeRequest: getRequest,
  // geocodeProvider: 'esri-world-geocoder',
  scaleBar: 'metric',
  hasAutoMode: true,
  styles: [{
    name: 'default',
    attribution: `Contains OS data ${String.fromCharCode(169)} Crown copyright and database rights ${(new Date()).getFullYear()}`,
    url: process.env.DEFAULT_URL
  }, {
    name: 'dark',
    attribution: 'Test',
    url: process.env.DARK_URL
  },{
    name: 'aerial',
    url: process.env.AERIAL_URL,
    logo: null
  },{
    name: 'deuteranopia',
    attribution: 'Test',
    url: process.env.DEUTERANOPIA_URL
  },{
    name: 'tritanopia',
    attribution: 'Test',
    url: process.env.TRITANOPIA_URL
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
    // title: 'Menu',
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
  draw: {  
    heading: 'Get boundary report',
    summary: 'Add or edit a boundary',
    collapse: 'collapse',
    maxFeatureSize: 1000, // Metres
    // tool: 'square',
    tools: ['circle', 'square', 'polygon'], // ['square', 'circle', 'line', 'polygon', 'point'],
    helpURL: 'https://www.google.co.uk',
    keyLabel: 'Report area',
    queryLabel: 'Get site report',
    // styles: [{
    //   name: 'default',
    //   url: process.env.OS_VTAPI_DEFAULT_DRAW_URL,
    //   attribution
    // }, {
    //   name: 'dark',
    //   url: process.env.OS_VTAPI_DARK_DRAW_URL,
    //   attribution
    // }],
    // minZoom: 12,
    // maxZoom: 21,
    // feature: {type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-2.940542,54.89875],[-2.942075,54.898706],[-2.943593,54.898577],[-2.945082,54.898362],[-2.946527,54.898065],[-2.947915,54.897688],[-2.949231,54.897234],[-2.950463,54.896708],[-2.9516,54.896115],[-2.952631,54.895461],[-2.953545,54.894752],[-2.954334,54.893995],[-2.954989,54.893197],[-2.955506,54.892366],[-2.955879,54.89151],[-2.956104,54.890637],[-2.956178,54.889755],[-2.956103,54.888874],[-2.955877,54.888001],[-2.955504,54.887145],[-2.954987,54.886314],[-2.954331,54.885516],[-2.953542,54.884759],[-2.952627,54.884051],[-2.951597,54.883397],[-2.95046,54.882804],[-2.949228,54.882279],[-2.947912,54.881825],[-2.946525,54.881448],[-2.94508,54.88115],[-2.943592,54.880936],[-2.942075,54.880807],[-2.940542,54.880763],[-2.93901,54.880807],[-2.937492,54.880936],[-2.936004,54.88115],[-2.93456,54.881448],[-2.933173,54.881825],[-2.931857,54.882279],[-2.930624,54.882804],[-2.929487,54.883397],[-2.928457,54.884051],[-2.927543,54.884759],[-2.926754,54.885516],[-2.926097,54.886314],[-2.92558,54.887145],[-2.925207,54.888001],[-2.924982,54.888874],[-2.924906,54.889755],[-2.924981,54.890637],[-2.925206,54.89151],[-2.925578,54.892366],[-2.926095,54.893197],[-2.926751,54.893995],[-2.92754,54.894752],[-2.928454,54.895461],[-2.929484,54.896115],[-2.930621,54.896708],[-2.931854,54.897234],[-2.93317,54.897688],[-2.934557,54.898065],[-2.936002,54.898362],[-2.937491,54.898577],[-2.939009,54.898706],[-2.940542,54.89875]]]}}
    feature: {type: 'Feature', geometry: {type: 'Polygon', coordinates: [[[-2.9429075279402355,54.90446285679516],[-2.9320064720603227,54.90446285679516],[-2.9330064720603227,54.8991948992828],[-2.9429075279402355,54.8981948992828],[-2.9429075279402355,54.90446285679516]]]}}
  },
  // queryLocation: []
})

// Component is ready and we have access to map
// We can listen for map events now, such as 'loaded'
fm.addEventListener('ready', e => {
  map = fm.map
})

// Listen for segments, layers or style changes
fm.addEventListener('change', e => {
  // Change
})

// Listen to map queries
fm.addEventListener('query', e => {
  // Query
})

// Listen for actions
fm.addEventListener('action', e => {
  // console.log(e.detail)
})