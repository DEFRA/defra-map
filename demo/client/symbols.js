const getSymbols = () => [
  'severe',
  'warning',
  'alert',
  'removed',
  'river-high',
  'river-normal',
  'river-error',
  'sea-normal',
  'sea-error',
  'groundwater-high',
  'groundwater-normal',
  'groundwater-error',
  'rainfall-wet',
  'rainfall-dry',
  'rainfall-error',
  'station-alert',
  'station-normal',
  'station-low',
  'station-error'
].map(s => `/assets/images/symbols/${s}.svg`)

export default getSymbols
