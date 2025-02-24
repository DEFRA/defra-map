import 'jest-canvas-mock'

import { capabilities, getArrayFindLast } from '../../src/js/lib/capabilities'

describe('capabilities', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return no support', () => {
    const result = {
      isSupported: false,
      error: 'WebGL is not supported'
    }

    expect(capabilities.default.getDevice()).toEqual(result)
    expect(capabilities.esri.getDevice()).toEqual(result)
  })

  it('should return full supported capabilities', () => {
    Object.defineProperty(window, 'WebGLRenderingContext', {
      writable: true,
      value: true
    })

    const result = {
      isSupported: false,
      error: 'WebGL is supported, but disabled'
    }

    expect(capabilities.default.getDevice()).toEqual(result)
  })

  it('should support "getArrayFindLast"', () => {
    expect(getArrayFindLast()).toEqual({ isSupported: true })
  })
})
