export const dataLayers = [{
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
},{
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
}]

// Land cover, hedgerows