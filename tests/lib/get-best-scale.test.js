import { getBestScale } from '../../src/js/lib/get-best-scale'

const testValues = [
  [0.1, 10, 'metric', { label: 1, symbol: 'm', width: 10, unit: 'metre' }],
  [1.038, 120, 'metric', { label: 100, symbol: 'm', width: 96.34, unit: 'metres' }],
  [2.038, 120, 'metric', { label: 200, symbol: 'm', width: 98.14, unit: 'metres' }],
  [500, 200, 'metric', { label: 100, symbol: 'km', width: 200, unit: 'kilometres' }],
  [500, 2, 'metric', { label: 1, symbol: 'km', width: 2, unit: 'kilometre' }],
  [1000, 200, 'metric', { label: 200, symbol: 'km', width: 200, unit: 'kilometres' }],
  [10000, 2000, 'metric', { label: 20000, symbol: 'km', width: 2000, unit: 'kilometres' }],
  [1600, 4, 'metric', { label: 5, symbol: 'km', width: 3.13, unit: 'kilometres' }],
  [1600, 2, 'metric', { label: 3, symbol: 'km', width: 1.88, unit: 'kilometres' }],
  [500, 2, 'imperial', { label: 3000, symbol: 'ft', width: 1.83, unit: 'feet' }],
  [1000, 200, 'imperial', { label: 100, symbol: 'mi', width: 160.93, unit: 'miles' }],
  [10000, 2000, 'imperial', { label: 50000000, symbol: 'ft', width: 1524, unit: 'feet' }]
]
describe('getBestScale', () => {
  testValues.forEach(([metersPerPx, maxWidthPx, unitSystem, expectedResults]) => {
    it(`should return ${JSON.stringify(expectedResults)} for values ${metersPerPx}, ${maxWidthPx}, ${unitSystem}}`, async () => {
      expect(getBestScale(metersPerPx, maxWidthPx, unitSystem)).toEqual(expectedResults)
    })
  })
})
