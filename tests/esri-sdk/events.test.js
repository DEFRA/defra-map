import {
  handleBaseTileLayerLoaded,
  handleStyleChange,
  handleStationary,
  handleMoveStart,
  handleMove
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
      dispatchEvent: jest.fn()
    }

    handleBaseTileLayerLoaded(provider)

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

    handleStyleChange(provider)

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
      view: { resolution: 100 },
      dispatchEvent: jest.fn()
    }

    await handleStationary(provider)

    expect(getDetail).toHaveBeenCalled()
    expect(provider.dispatchEvent).toHaveBeenCalled()
    expect(provider.isUserInitiated).toEqual(false)
  })

  it('should handleMoveStart', () => {
    const provider = {
      dispatchEvent: jest.fn()
    }

    handleMoveStart(provider)

    expect(provider.dispatchEvent).toHaveBeenCalled()
  })

  it('should handleMove', () => {
    const provider = {
      dispatchEvent: jest.fn(),
      view: { resolution: 100 }
    }

    handleMove(provider)

    expect(provider.dispatchEvent).toHaveBeenCalled()
  })
})
