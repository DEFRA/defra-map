import ReverseGeocode from '../../../src/js/provider/os-open-names/reverse-geocode'

jest.mock('../../../src/js/provider/os-open-names/config.json', () => ({
  OS_NEAREST_URL: 'https://example.com/{easting}/{northing}'
}))

describe('getNearest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the formatted place name with all fields', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          results: [{
            GAZETTEER_ENTRY: {
              NAME1: 'Test Name',
              POPULATED_PLACE: 'Test Place',
              COUNTY_UNITARY: 'Test County',
              REGION: 'Test Region'
            }
          }]
        })
      })
    )
    const zoom = 14
    const coord = [123456, 654321]
    const transformGeocodeRequest = jest.fn(url => url)
    const reverseGeocode = new ReverseGeocode(transformGeocodeRequest)
    const result = await reverseGeocode.getNearest(zoom, coord)
    expect(result).toBe('Test Name, Test Place, Test County, Test Region')
  })

  it('should return formatted place name with only required fields', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          results: [{
            GAZETTEER_ENTRY: {
              NAME1: 'Test Name',
              REGION: 'Test Region'
            }
          }]
        })
      })
    )
    const zoom = 14
    const coord = [123456, 654321]
    const transformGeocodeRequest = jest.fn(url => url)
    const reverseGeocode = new ReverseGeocode(transformGeocodeRequest)
    const result = await reverseGeocode.getNearest(zoom, coord)
    expect(result).toBe('Test Name, Test Region')
  })

  it('should throw an error if results array is empty', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] })
      })
    )
    const zoom = 14
    const coord = [123456, 654321]
    const transformGeocodeRequest = jest.fn(url => url)
    const reverseGeocode = new ReverseGeocode(transformGeocodeRequest)
    await expect(reverseGeocode.getNearest(zoom, coord))
      .rejects.toThrow(/Cannot read properties of undefined/)
  })

  it('should throw an error if GAZETTEER_ENTRY is missing', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          results: [{ }]
        })
      })
    )
    const zoom = 14
    const coord = [123456, 654321]
    const transformGeocodeRequest = jest.fn(url => url)
    const reverseGeocode = new ReverseGeocode(transformGeocodeRequest)
    await expect(reverseGeocode.getNearest(zoom, coord))
      .rejects.toThrow(/Cannot read properties of undefined/)
  })

  it('should handle network errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    )
    const zoom = 14
    const coord = [123456, 654321]
    const transformGeocodeRequest = jest.fn(url => url)
    const reverseGeocode = new ReverseGeocode(transformGeocodeRequest)
    await expect(reverseGeocode.getNearest(zoom, coord))
      .rejects.toThrow('Network error')
  })

  it('should verify URL transformation', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({ results: null })
    }))
    const zoom = 14
    const coord = [123.456, 654.321]
    const transformGeocodeRequest = jest.fn(url => 'transformed-' + url)
    const reverseGeocode = new ReverseGeocode(transformGeocodeRequest)
    await reverseGeocode.getNearest(zoom, coord)
    expect(transformGeocodeRequest).toHaveBeenCalledWith('https://example.com/123/654')
    expect(global.fetch).toHaveBeenCalledWith('transformed-https://example.com/123/654')
  })
})
