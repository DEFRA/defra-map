import { FloodMap } from '../../src/flood-map.js'
import { getCookie } from './utils.js'

const token = getCookie('token')

const fm = new FloodMap('map', {
  type: 'buttonFirst', // 'hybrid',
  place: 'Newport, Isle of White',
  // zoom: 12,
  minZoom: 6,
  maxZoom: 18,
  // centre: [-1.311179,50.668434],
  bbox: [-2.989707, 54.864555, -2.878635, 54.937635],
  // hasReset: true,
  height: '600px',
  provider: {
    osApiKey: process.env.OS_API_KEY,
    defaultUrl: process.env.OS_VTAPI_DEFAULT_URL,
    darkUrl: process.env.OS_VTAPI_DARK_URL,
    aerialUrl: `${process.env.ESRI_AERIAL_URL}&token=${token}`,
    reverseGeocodeProvider: 'esri-world-geocoder',
    reverseGeocodeToken: token,
    imagesPath: '/assets/images',
    symbolPath: '/assets/images/symbols',
    symbolName: ['location']
  },
  search: {
    label: 'Search for a place',
    isAutocomplete: true,
    hasGeoLocation: true,
    provider: 'esri-world-geocoder',
    token
  },
  legend: {
    // width: '360px',
    // display: 'inset',
    // isVisible: true,
    title: 'Menu',
    keyDisplay: 'none',
    isPersistInUrl: true,
    symbolPath: '/assets/images/symbols',
    segments: [
      {
        heading: 'Time frame',
        // display: 'timeline',
        collapse: 'collapse',
        items: [
          {
            id: 'pr',
            label: 'Present day'
          },
          {
            id: 'c1',
            label: '2040\' to 2060\'s'
          }
          // {
          //     id: 'c2',
          //     label: '2080, with climate change'
          // }

        ]
      },
      {
        id: 'sf',
        heading: 'Source of flooding',
        collapse: 'collapse',
        items: [
          {
            id: 'all',
            label: 'River, sea and surface water'
          },
          {
            id: 'rs',
            label: 'River and the sea'
          },
          {
            id: 'sw',
            label: 'Surface water'
          }
        ]
      }
      // {
      //     id: 'af1',
      //     heading: 'Likelihood of flooding',
      //     // display: 'segmented',
      //     collapse: 'collapse',
      //     parentIds: ['all', 'sw'],
      //     items: [
      //         {
      //             id: 'hr',
      //             label: 'At least once in the lifetime of a mortgage (30 years)'
      //         },
      //         {
      //             id: 'mr',
      //             label: '1% to 3.3% (Medium risk)'
      //         },
      //         {
      //             id: 'lr',
      //             label: '0.1% to 1% (Low risk)'
      //         }
      //     ]
      // },
      // {
      //     id: 'af2',
      //     heading: 'Likelihood of flooding',
      //     // display: 'segmented',
      //     collapse: 'collapse',
      //     parentIds: ['rs'],
      //     items: [
      //         {
      //             id: 'hr',
      //             label: 'At least once in the lifetime of a mortgage (30 years)'
      //         },
      //         {
      //             id: 'mr',
      //             label: '1% to 3.3% (Medium risk)'
      //         },
      //         {
      //             id: 'lr',
      //             label: '0.1% to 1% (Low risk)'
      //         },
      //         {
      //             id: 'vl',
      //             label: 'Below 0.1% (Very low risk)'
      //         }
      //     ]
      // }
    ],
    key: [
      {
        type: 'symbol',
        heading: 'Flood extent',
        parentIds: ['all', 'sw'],
        items: [
          {
            id: 'hr',
            label: 'At least once in the lifetime of a typical mortgage<br/>(High risk)',
            fill: '#B26C28',
            isSelected: true
          },
          {
            id: 'mr',
            label: 'At least once in 100 years<br/>(Medium risk)',
            fill: '#E48824'
          },
          {
            id: 'lr',
            label: 'At least once in 1000 years<br/>(Low risk)',
            fill: '#FBAA34'
          }
        ]
      },
      {
        heading: 'Flood extent',
        parentIds: ['rs'],
        items: [
          {
            id: 'hr',
            label: 'At least once in the lifetime of a typical mortgage<br/>(High risk)',
            fill: '#B26C28',
            isSelected: true
          },
          {
            id: 'mr',
            label: 'At least once in 100 years<br/>(Medium risk)',
            fill: '#E48824'
          },
          {
            id: 'lr',
            label: 'At least once in 1000 years<br/>(Low risk)',
            fill: '#FBAA34'
          },
          {
            id: 'vl',
            label: 'Less than once in 1000 years<br/>(Very low risk)',
            fill: '#FFD599'
          }
        ]
      },
      {
        type: 'symbol',
        heading: 'Map features',
        isSelected: true,
        items: [
          {
            id: 'lo',
            label: 'Location',
            icon: 'location',
            isSelected: true
          }
        ]
      }
    ]
  },
  queryFeature: ['point', 'polygon']
})

// Component is ready and we have access to map
// We can listen for map events now, such as 'loaded'
fm.addEventListener('ready', async e => {
  const { map, view } = e.detail
  console.log('ready', map, view)
})

// Listen for segments, layers or style changes
fm.addEventListener('change', e => {
  console.log('change', e.detail)
})

// Listen to map queries
fm.addEventListener('query', e => {
  fm.info = e.detail.id
    ? {
        width: '360px',
        label: e.detail.properties.name,
        html: '<p>Feature content</p><p><a href="">Link</a></p>'
      }
    : null
})
