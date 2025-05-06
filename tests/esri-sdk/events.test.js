import {
  handleBaseTileLayerLoaded,
  handleStyleChange,
  handleStationary,
  handleMoveStart
} from '../../src/js/provider/esri-sdk/events'

import { getDetail } from '../../src/js/provider/esri-sdk/query'

jest.mock('../../src/js/provider/esri-sdk/marker', () => ({
  reColourMarkers: jest.fn()
}))

jest.mock('../../src/js/provider/esri-sdk/query')

describe('esri-sdk events', () => {
  it('should handleBaseTileLayerLoaded', () => {
    const provider = {
      isLoaded: false,
      view: { resolution: 15 },
      dispatchEvent: jest.fn()
    }

    handleBaseTileLayerLoaded.bind(provider)()

    expect(provider.dispatchEvent).toHaveBeenCalled()
    expect(provider.isLoaded).toEqual(true)
  })

  it('should handleStyleChange', () => {
    const provider = {
      draw: {
        reColour: jest.fn()
      },
      dispatchEvent: jest.fn()
    }

    handleStyleChange.bind(provider)()

    expect(provider.dispatchEvent).toHaveBeenCalled()
    expect(provider.draw.reColour).toHaveBeenCalled()
  })

  it('should handleStationary', async () => {
    jest.mocked(getDetail).mockResolvedValue({})

    const provider = {
      paddingBox: {
        offsetTop: 1,
        offsetLeft: 2,
        offsetWidth: 3,
        offsetHeight: 4,
        parentNode: {
          offsetTop: 5,
          offsetLeft: 6
        }
      },
      isUserInitiated: true,
      dispatchEvent: jest.fn()
    }

    await handleStationary.bind(provider)()

    expect(getDetail).toHaveBeenCalled()
    expect(provider.dispatchEvent).toHaveBeenCalled()
    expect(provider.isUserInitiated).toEqual(false)
  })

  it('should handleMoveStart', () => {
    const provider = {
      dispatchEvent: jest.fn()
    }

    handleMoveStart.bind(provider)()

    expect(provider.dispatchEvent).toHaveBeenCalled()
  })
})
