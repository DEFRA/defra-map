export const dataLayers = [
{
  id: 'field-parcels',
  label: 'Field parcels',
  filter: ['!=', ['get', 'SBI'], '106223377'],
  url: process.env.WFS_DATA_URL,
  stroke: { outdoor: '#b1b4b6', dark: '#28a197', aerial: 'rgba(40,161,151,0.8)', 'black-and-white': '#28a197' },
  strokeWidth: 2,
  // strokeDashArray: [1, 2],
  fill: 'transparent',
  symbolDescription: { outdoor: 'turquiose outline' },
  minZoom: 15,
  maxZoom: 24,
  showInLegend: true,
  canToggle: true
},
{
  id: 'linked-parcels',
  label: 'Existing fields',
  filter: ['==', ['get', 'SBI'], '106223377'],
  url: process.env.WFS_DATA_URL,
  stroke: '#0000ff',
  strokeWidth: 2,
  fill: 'rgba(0,0,255,0.1)',
  symbolDescription: { outdoor: 'blue outline' },
  minZoom: 15,
  maxZoom: 24
},
{
  id: 'bps-ineligible',
  label: 'BPS ineligible feature',
  filter: ['==', ['get', 'LAND_COVER_CLASS_CODE'], '999'],
  url: process.env.WFS_LAND_COVERS_URL,
  stroke: '#75430f',
  strokeWidth: 2,
  fill: 'rgba(117,67,15,0.1)',
  symbolDescription: { outdoor: 'red outline' },
  minZoom: 15,
  maxZoom: 24
},
{
  id: 'arable-land',
  label: 'Arable land',
  filter: ['==', ['get', 'LAND_COVER_CLASS_CODE'], '110'],
  url: process.env.WFS_LAND_COVERS_URL,
  stroke: '#ddb334',
  strokeWidth: 2,
  fill: 'rgba(221,179,52,0.1)',
  symbolDescription: { outdoor: 'red outline' },
  minZoom: 15,
  maxZoom: 24
},
{
  id: 'permanent-crops',
  label: 'Permanent crops',
  filter: ['==', ['get', 'LAND_COVER_CLASS_CODE'], '130'],
  url: process.env.WFS_LAND_COVERS_URL,
  stroke: '#0db951',
  strokeWidth: 2,
  fill: 'rgba(13,185,81,0.1)',
  symbolDescription: { outdoor: 'red outline' },
  minZoom: 15,
  maxZoom: 24
},
{
  id: 'permanent-grassland',
  label: 'Permanent grassland',
  filter: ['==', ['get', 'LAND_COVER_CLASS_CODE'], '131'],
  url: process.env.WFS_LAND_COVERS_URL,
  stroke: '#34e591',
  strokeWidth: 2,
  fill: 'rgba(52,229,145,0.1)',
  symbolDescription: { outdoor: 'red outline' },
  minZoom: 15,
  maxZoom: 24
},
{
  id: 'hedge-control',
  label: 'Hedge control',
  // filter: ['==', ['get', 'SBI'], '106223377'],
  url: process.env.WFS_HEDGE_CONTROL_URL,
  stroke: '#75430f',
  strokeWidth: 2,
  fill: 'transparent',
  symbolDescription: { outdoor: 'red outline' },
  minZoom: 15,
  maxZoom: 24
},
{
  id: 'selected-parcel',
  label: 'Selected parcel',
  filter: ['==', ['get', 'ID'], '999'],
  url: process.env.WFS_DATA_URL,
  stroke: '#ff0000',
  strokeWidth: 2,
  // strokeDashArray: [1, 2],
  fill: 'rgba(255,0,0,0.1)',
  symbolDescription: { outdoor: 'red outline' },
  minZoom: 15,
  maxZoom: 24,
  showInLegend: true,
  canToggle: true
}
]

// Land cover, hedgerows