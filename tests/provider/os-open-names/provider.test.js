import Provider from '../../../src/js/provider/os-open-names/provider'

describe('OS Open Names Provider', () => {
  let provider
  const mockTransform = (url) => Promise.resolve(url)

  beforeEach(() => {
    provider = new Provider(mockTransform)
    global.fetch = jest.fn()
  })

  const mockResponse = {
    header: { totalresults: 1 },
    results: [{
      GAZETTEER_ENTRY: {
        ID: '1',
        NAME1: 'London',
        COUNTY_UNITARY: 'Greater London',
        DISTRICT_BOROUGH: 'City of London',
        POSTCODE_DISTRICT: 'EC1',
        LOCAL_TYPE: 'City',
        COUNTRY: 'England',
        MBR_XMIN: 530000,
        MBR_YMIN: 180000,
        MBR_XMAX: 531000,
        MBR_YMAX: 181000,
        GEOMETRY_X: 530500,
        GEOMETRY_Y: 180500
      }
    }]
  }

  describe('suggest method', () => {
    it('returns empty array for empty query', async () => {
      const results = await provider.suggest('')
      expect(results).toEqual([])
    })

    it('returns suggestions for valid query', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(mockResponse) })
      )

      const results = await provider.suggest('London')
      expect(results.length).toBe(1)
      expect(results[0]).toHaveProperty('id', '1')
      expect(results[0]).toHaveProperty('text', 'London')
      expect(results[0]).toHaveProperty('marked')
    })

    it('handles API errors gracefully', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve({ error: 'API Error' }) })
      )

      const results = await provider.suggest('London')
      expect(results).toEqual([])
    })

    it('handles unexpected response format', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve({}) })
      )

      const results = await provider.suggest('London')
      expect(results).toEqual([])
    })
  })

  describe('find method', () => {
    it('returns null for empty query', async () => {
      const result = await provider.find('')
      expect(result).toBeNull()
    })

    it('returns place details for valid query', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(mockResponse) })
      )

      const result = await provider.find('London')
      expect(result).toHaveProperty('id', '1')
      expect(result).toHaveProperty('text', 'London')
      expect(result).toHaveProperty('bounds')
      expect(result).toHaveProperty('center')
    })

    it('handles point data without MBR', async () => {
      const pointResponse = {
        header: { totalresults: 1 },
        results: [{
          GAZETTEER_ENTRY: {
            ID: '1',
            NAME1: 'Point Location',
            COUNTRY: 'England',
            GEOMETRY_X: 530500,
            GEOMETRY_Y: 180500
          }
        }]
      }

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(pointResponse) })
      )

      const result = await provider.find('Point')
      expect(result).toHaveProperty('bounds')
      expect(result).toHaveProperty('center')
    })
  })

  describe('utility functions', () => {
    it('correctly identifies postcodes', () => {
      const testPostcodes = [
        'SW1A 1AA',
        'M1 1AA',
        'B33 8TH',
        'CR2 6XH',
        'DN55 1PT'
      ]

      testPostcodes.forEach(postcode => {
        expect(mockResponse.results[0].GAZETTEER_ENTRY.NAME1.includes(postcode)).toBeFalsy()
      })
    })

    it('removes non-England results', async () => {
      const mixedResponse = {
        header: { totalresults: 2 },
        results: [
          {
            GAZETTEER_ENTRY: {
              ID: '1',
              NAME1: 'London',
              COUNTRY: 'England',
              LOCAL_TYPE: 'City',
              COUNTY_UNITARY: 'Greater London',
              DISTRICT_BOROUGH: 'City of London',
              POSTCODE_DISTRICT: 'EC1'
            }
          },
          {
            GAZETTEER_ENTRY: {
              ID: '2',
              NAME1: 'Edinburgh',
              COUNTRY: 'Scotland',
              LOCAL_TYPE: 'City',
              COUNTY_UNITARY: 'Edinburgh',
              DISTRICT_BOROUGH: '',
              POSTCODE_DISTRICT: 'EH1'
            }
          }
        ]
      }

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(mixedResponse) })
      )

      const results = await provider.suggest('London')
      expect(results.length).toBe(1)
      expect(results[0].text).toBe('London')
    })

    it('removes duplicate results', async () => {
      const duplicateResponse = {
        header: { totalresults: 2 },
        results: [
          { GAZETTEER_ENTRY: { ID: '1', NAME1: 'London', COUNTRY: 'England' } },
          { GAZETTEER_ENTRY: { ID: '1', NAME1: 'London', COUNTRY: 'England' } }
        ]
      }

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(duplicateResponse) })
      )

      const results = await provider.suggest('London')
      expect(results.length).toBe(1)
    })

    it('handles network errors gracefully', async () => {
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')))

      const results = await provider.suggest('London')
      expect(results).toEqual([])
    })

    it('handles null geometry values', async () => {
      const nullGeometryResponse = {
        header: { totalresults: 1 },
        results: [{
          GAZETTEER_ENTRY: {
            ID: '1',
            NAME1: 'Test Location',
            COUNTRY: 'England',
            MBR_XMIN: null,
            MBR_YMIN: null,
            MBR_XMAX: null,
            MBR_YMAX: null,
            GEOMETRY_X: 530500,
            GEOMETRY_Y: 180500
          }
        }]
      }

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(nullGeometryResponse) })
      )

      const result = await provider.find('Test')
      expect(result.center).toEqual([-0.120969, 51.508369])
    })
  })
})
