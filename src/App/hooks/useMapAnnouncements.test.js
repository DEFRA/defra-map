import { renderHook } from '@testing-library/react'
import { useMapAnnouncements } from './useMapAnnouncements'
import { useConfig } from '../store/configContext.js'
import { useService } from '../store/serviceContext.js'
import { getMapStatusMessage } from '../../utils/getMapStatusMessage.js'
import eventBus from '../../services/eventBus.js'

jest.mock('../store/configContext.js')
jest.mock('../store/serviceContext.js')
jest.mock('../../utils/getMapStatusMessage.js')
jest.mock('../../services/eventBus.js')

const setup = (overrides = {}) => {
  const announce = jest.fn()
  const mapProvider = {
    getAreaDimensions: jest.fn(() => ({ width: 100, height: 100 })),
    getCardinalMove: jest.fn(() => 'north'),
    ...overrides.mapProvider
  }

  useConfig.mockReturnValue({ mapProvider, ...overrides.config })
  useService.mockReturnValue({ announce, ...overrides.service })

  getMapStatusMessage.moved = jest.fn(() => 'Moved north')
  getMapStatusMessage.zoomed = jest.fn(() => 'Zoomed in')
  getMapStatusMessage.noChange = jest.fn(() => 'No change')
  getMapStatusMessage.newArea = jest.fn(() => 'New area')

  return { announce, mapProvider }
}

describe('useMapAnnouncements', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('subscribes to map:stateupdated event on mount', () => {
    setup()
    renderHook(() => useMapAnnouncements())
    expect(eventBus.on).toHaveBeenCalledWith('map:stateupdated', expect.any(Function))
  })

  test('unsubscribes from event on unmount', () => {
    setup()
    const { unmount } = renderHook(() => useMapAnnouncements())
    unmount()
    expect(eventBus.off).toHaveBeenCalledWith('map:stateupdated', expect.any(Function))
  })

  test('early returns when previous or current center is missing', () => {
    const { announce } = setup()
    renderHook(() => useMapAnnouncements())
    const handler = eventBus.on.mock.calls[0][1]

    handler({ previous: {}, current: { center: [0, 0] } })
    expect(announce).not.toHaveBeenCalled()

    handler({ previous: { center: [0, 0] }, current: {} })
    expect(announce).not.toHaveBeenCalled()
  })

  test('announces moved message when only center changes', () => {
    const { announce, mapProvider } = setup()
    renderHook(() => useMapAnnouncements())
    const handler = eventBus.on.mock.calls[0][1]

    handler({
      previous: { center: [0, 0], zoom: 10 },
      current: { center: [1, 1], zoom: 10 }
    })

    expect(mapProvider.getCardinalMove).toHaveBeenCalledWith([0, 0], [1, 1])
    expect(getMapStatusMessage.moved).toHaveBeenCalledWith({
      direction: 'north',
      areaDimensions: { width: 100, height: 100 }
    })
    expect(announce).toHaveBeenCalledWith('Moved north', 'core')
  })

  test('announces zoomed message when only zoom changes', () => {
    const { announce } = setup()
    renderHook(() => useMapAnnouncements())
    const handler = eventBus.on.mock.calls[0][1]

    handler({
      previous: { center: [0, 0], zoom: 10 },
      current: { center: [0, 0], zoom: 12 }
    })

    expect(getMapStatusMessage.zoomed).toHaveBeenCalledWith({
      center: [0, 0],
      zoom: 12,
      from: 10,
      to: 12,
      areaDimensions: { width: 100, height: 100 }
    })
    expect(announce).toHaveBeenCalledWith('Zoomed in', 'core')
  })

  test('announces no change message when neither center nor zoom changes', () => {
    const { announce } = setup()
    renderHook(() => useMapAnnouncements())
    const handler = eventBus.on.mock.calls[0][1]

    handler({
      previous: { center: [0, 0], zoom: 10 },
      current: { center: [0, 0], zoom: 10 }
    })

    expect(getMapStatusMessage.noChange).toHaveBeenCalledWith({
      center: [0, 0],
      zoom: 10
    })
    expect(announce).toHaveBeenCalledWith('No change', 'core')
  })

  test('announces new area message when both center and zoom change', () => {
    const { announce } = setup()
    renderHook(() => useMapAnnouncements())
    const handler = eventBus.on.mock.calls[0][1]

    handler({
      previous: { center: [0, 0], zoom: 10 },
      current: { center: [1, 1], zoom: 12 }
    })

    expect(getMapStatusMessage.newArea).toHaveBeenCalledWith({
      center: [1, 1],
      zoom: 12,
      areaDimensions: { width: 100, height: 100 }
    })
    expect(announce).toHaveBeenCalledWith('New area', 'core')
  })

  test('detects center change correctly for lat or lng', () => {
    renderHook(() => useMapAnnouncements())
    const handler = eventBus.on.mock.calls[0][1]

    handler({
      previous: { center: [0, 0], zoom: 10 },
      current: { center: [1, 0], zoom: 10 }
    })
    expect(getMapStatusMessage.moved).toHaveBeenCalled()

    jest.clearAllMocks()
    handler({
      previous: { center: [0, 0], zoom: 10 },
      current: { center: [0, 1], zoom: 10 }
    })
    expect(getMapStatusMessage.moved).toHaveBeenCalled()
  })

  test('does not announce when message is falsy', () => {
    const { announce } = setup()
    getMapStatusMessage.noChange = jest.fn(() => null)

    renderHook(() => useMapAnnouncements())
    const handler = eventBus.on.mock.calls[0][1]

    handler({
      previous: { center: [0, 0], zoom: 10 },
      current: { center: [0, 0], zoom: 10 }
    })

    expect(announce).not.toHaveBeenCalled()
  })
})
