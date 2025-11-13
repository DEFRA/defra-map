// reverseGeocode.test.js
import { createReverseGeocode, reverseGeocode } from './reverseGeocode'

describe('reverseGeocode module', () => {
  beforeEach(() => {
    // Reset module state between tests
    jest.resetModules()
  })

  it('throws if reverseGeocodeFn is not initialised', () => {
    expect(() => reverseGeocode(10, [0, 0])).toThrow('ReverseGeocode not initialised')
  })

  it('sets reverseGeocodeFn via createReverseGeocode', async () => {
    const mockProviderFn = jest.fn().mockResolvedValue('result')
    const provider = {
      load: jest.fn().mockResolvedValue(mockProviderFn)
    }
    const transformRequest = jest.fn()
    const crs = 'EPSG:4326'

    createReverseGeocode(provider, transformRequest, crs)

    const result = await reverseGeocode(12, [1, 2])

    expect(provider.load).toHaveBeenCalled()
    expect(mockProviderFn).toHaveBeenCalledWith(12, [1, 2], transformRequest, crs)
    expect(result).toBe('result')
  })

  it('supports multiple calls after initialisation', async () => {
    const mockProviderFn = jest.fn().mockResolvedValue('ok')
    const provider = { load: jest.fn().mockResolvedValue(mockProviderFn) }

    createReverseGeocode(provider, null, null)

    const r1 = await reverseGeocode(5, [10, 20])
    const r2 = await reverseGeocode(8, [30, 40])

    expect(mockProviderFn).toHaveBeenCalledTimes(2)
    expect(r1).toBe('ok')
    expect(r2).toBe('ok')
  })
})
