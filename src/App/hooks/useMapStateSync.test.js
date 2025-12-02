import { renderHook, act } from '@testing-library/react'
import { useMapStateSync } from './useMapStateSync'
import { useConfig } from '../store/configContext.js'
import { useMap } from '../store/mapContext.js'
import eventBus from '../../services/eventBus.js'

jest.mock('../store/configContext.js')
jest.mock('../store/mapContext.js')
jest.mock('../../services/eventBus.js')

describe('useMapStateSync', () => {
  let mockMapProvider, mockDispatch

  beforeEach(() => {
    mockMapProvider = {
      getCenter: jest.fn(() => ({ lat: 51.5, lng: -0.1 })),
      getZoom: jest.fn(() => 10)
    }
    mockDispatch = jest.fn()

    eventBus.on = jest.fn()
    eventBus.off = jest.fn()
    eventBus.emit = jest.fn()

    useConfig.mockReturnValue({ mapProvider: mockMapProvider })
    useMap.mockReturnValue({ dispatch: mockDispatch })
  })

  it('does nothing when no mapProvider (line 13)', () => {
    useConfig.mockReturnValue({ mapProvider: null })
    renderHook(() => useMapStateSync())

    expect(eventBus.on).not.toHaveBeenCalled()
  })

  it('registers event listeners on mount', () => {
    renderHook(() => useMapStateSync())

    expect(eventBus.on).toHaveBeenCalledWith('map:move', expect.any(Function))
    expect(eventBus.on).toHaveBeenCalledWith('map:moveend', expect.any(Function))
    expect(eventBus.on).toHaveBeenCalledWith('map:firstidle', expect.any(Function))
  })

  it('handles map:move event', () => {
    renderHook(() => useMapStateSync())

    const handleMapMove = eventBus.on.mock.calls.find(call => call[0] === 'map:move')[1]
    const payload = { center: { lat: 51.5, lng: -0.1 }, zoom: 12 }

    act(() => handleMapMove(payload))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'MAP_MOVE',
      payload
    })
  })

  it('handles map:moveend event and emits stateupdated', () => {
    renderHook(() => useMapStateSync())

    const handleMapMoveEnd = eventBus.on.mock.calls.find(call => call[0] === 'map:moveend')[1]
    const payload1 = { center: { lat: 51.5, lng: -0.1 }, zoom: 12 }
    const payload2 = { center: { lat: 52.0, lng: -0.2 }, zoom: 13 }

    act(() => handleMapMoveEnd(payload1))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'MAP_MOVE_END',
      payload: payload1
    })
    expect(eventBus.emit).toHaveBeenCalledWith('map:stateupdated', {
      previous: null,
      current: payload1
    })

    act(() => handleMapMoveEnd(payload2))

    expect(eventBus.emit).toHaveBeenCalledWith('map:stateupdated', {
      previous: payload1,
      current: payload2
    })
  })

  it('handles map:firstidle only once (line 47)', () => {
    renderHook(() => useMapStateSync())

    const handleMapFirstIdle = eventBus.on.mock.calls.find(call => call[0] === 'map:firstidle')[1]
    const payload = { ready: true }

    act(() => handleMapFirstIdle(payload))

    expect(mockMapProvider.getCenter).toHaveBeenCalled()
    expect(mockMapProvider.getZoom).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'MAP_FIRST_IDLE',
      payload
    })

    mockMapProvider.getCenter.mockClear()
    mockMapProvider.getZoom.mockClear()

    act(() => handleMapFirstIdle(payload))

    expect(mockMapProvider.getCenter).not.toHaveBeenCalled() // line 47: already initialized
    expect(mockMapProvider.getZoom).not.toHaveBeenCalled()
  })

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useMapStateSync())

    const handleMapMove = eventBus.on.mock.calls.find(call => call[0] === 'map:move')[1]
    const handleMapMoveEnd = eventBus.on.mock.calls.find(call => call[0] === 'map:moveend')[1]
    const handleMapFirstIdle = eventBus.on.mock.calls.find(call => call[0] === 'map:firstidle')[1]

    unmount()

    expect(eventBus.off).toHaveBeenCalledWith('map:move', handleMapMove)
    expect(eventBus.off).toHaveBeenCalledWith('map:moveend', handleMapMoveEnd)
    expect(eventBus.off).toHaveBeenCalledWith('map:firstidle', handleMapFirstIdle)
  })

  it('re-registers listeners when mapProvider changes', () => {
    const { rerender } = renderHook(() => useMapStateSync())

    expect(eventBus.on).toHaveBeenCalledTimes(3)

    const newMapProvider = {
      getCenter: jest.fn(() => ({ lat: 40.7, lng: -74.0 })),
      getZoom: jest.fn(() => 8)
    }
    useConfig.mockReturnValue({ mapProvider: newMapProvider })

    rerender()

    expect(eventBus.off).toHaveBeenCalledTimes(3)
    expect(eventBus.on).toHaveBeenCalledTimes(6)
  })
})
