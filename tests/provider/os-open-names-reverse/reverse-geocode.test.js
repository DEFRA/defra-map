import ReverseGeocode from '../../../src/js/provider/os-open-names-reverse/reverse-geocode'
import { detectCoordinateType } from '../../../src/js/lib/viewport'
import { LatLon } from 'geodesy/osgridref.js'

jest.mock('../../../src/js/provider/os-open-names-reverse/config.json', () => ({
  URL: 'https://example.com/{easting}/{northing}'
}))

jest.mock('../../../src/js/lib/viewport', () => {
  const actual = jest.requireActual('../../../src/js/lib/viewport')
  return {
    ...actual,
    detectCoordinateType: jest.fn()
  }
})

describe('getNearest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    detectCoordinateType.mockImplementation(
      jest.requireActual('../../../src/js/lib/viewport').detectCoordinateType
    )
  })

  it('should use the default transformGeocodeRequest in a request', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: null })
      })
    )
    const reverseGeocode = new ReverseGeocode() // use default constructor
    await reverseGeocode.getNearest(14, [123456, 654321]) // ensure it runs
    expect(global.fetch).toHaveBeenCalled()
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

  it('should format place name correctly even if REGION is missing', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          results: [{
            GAZETTEER_ENTRY: {
              NAME1: 'Test Name',
              POPULATED_PLACE: 'Test Place',
              COUNTY_UNITARY: 'Test County'
              // REGION is intentionally missing
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
    expect(result).toBe('Test Name, Test Place, Test County, undefined')
  })

  it('should convert WGS84 to BNG and fetch result', async () => {
    detectCoordinateType.mockReturnValue('WSG84')

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          results: [{
            GAZETTEER_ENTRY: {
              NAME1: 'Converted Name',
              REGION: 'Converted Region'
            }
          }]
        })
      })
    )

    const wgs84Coord = [-0.1278, 51.5074] // longitude, latitude (London)
    const transformGeocodeRequest = jest.fn(url => url)
    const reverseGeocode = new ReverseGeocode(transformGeocodeRequest)

    const result = await reverseGeocode.getNearest(14, wgs84Coord)
    expect(result).toContain('Converted Name')
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

  it('should return null if LatLon.toOsGrid throws an error', async () => {
    detectCoordinateType.mockReturnValue('WSG84')

    // Mock LatLon.toOsGrid to throw
    jest.spyOn(LatLon.prototype, 'toOsGrid').mockImplementation(() => {
      throw new Error('Conversion failed')
    })

    const reverseGeocode = new ReverseGeocode()
    const result = await reverseGeocode.getNearest(14, [-1, 51])

    expect(result).toBeNull()
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
