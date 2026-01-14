import { renderHook } from '@testing-library/react'
import { useMapEvents } from './useMapEvents'
import { useConfig } from '../store/configContext.js'
import { useService } from '../store/serviceContext.js'

jest.mock('../store/configContext.js')
jest.mock('../store/serviceContext.js')

describe('useMapEvents', () => {
  let mockMapProvider, mockEventBus

  beforeEach(() => {
    mockMapProvider = {}
    mockEventBus = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    }
    useConfig.mockReturnValue({ mapProvider: mockMapProvider })
    useService.mockReturnValue({ eventBus: mockEventBus })
  })

  it('does nothing when no mapProvider (line 10)', () => {
    useConfig.mockReturnValue({ mapProvider: null })
    renderHook(() => useMapEvents({ 'test:event': jest.fn() }))

    expect(mockEventBus.on).not.toHaveBeenCalled()
  })

  it('registers event handlers when mapProvider exists', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const eventMap = {
      'map:click': callback1,
      'map:zoom': callback2
    }

    renderHook(() => useMapEvents(eventMap))

    expect(mockEventBus.on).toHaveBeenCalledTimes(2)
    expect(mockEventBus.on).toHaveBeenCalledWith('map:click', expect.any(Function))
    expect(mockEventBus.on).toHaveBeenCalledWith('map:zoom', expect.any(Function))
  })

  it('calls callbacks when events are triggered', () => {
    const callback = jest.fn()
    const eventMap = { 'map:click': callback }

    renderHook(() => useMapEvents(eventMap))

    const handler = mockEventBus.on.mock.calls[0][1]
    const mockEvent = { x: 100, y: 200 }
    handler(mockEvent)

    expect(callback).toHaveBeenCalledWith(mockEvent)
  })

  it('cleans up handlers on unmount', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const eventMap = {
      'map:click': callback1,
      'map:zoom': callback2
    }

    const { unmount } = renderHook(() => useMapEvents(eventMap))

    const handler1 = mockEventBus.on.mock.calls[0][1]
    const handler2 = mockEventBus.on.mock.calls[1][1]

    unmount()

    expect(mockEventBus.off).toHaveBeenCalledWith('map:click', handler1)
    expect(mockEventBus.off).toHaveBeenCalledWith('map:zoom', handler2)
  })

  it('re-registers handlers when eventMap changes', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    const { rerender } = renderHook(
      ({ eventMap }) => useMapEvents(eventMap),
      { initialProps: { eventMap: { 'map:click': callback1 } } }
    )

    expect(mockEventBus.on).toHaveBeenCalledTimes(1)

    rerender({ eventMap: { 'map:zoom': callback2 } })

    expect(mockEventBus.off).toHaveBeenCalledTimes(1)
    expect(mockEventBus.on).toHaveBeenCalledTimes(2)
    expect(mockEventBus.on).toHaveBeenCalledWith('map:zoom', expect.any(Function))
  })

  it('handles empty eventMap', () => {
    renderHook(() => useMapEvents({}))

    expect(mockEventBus.on).not.toHaveBeenCalled()
  })

  it('handles undefined eventMap (default parameter)', () => {
    renderHook(() => useMapEvents())

    expect(mockEventBus.on).not.toHaveBeenCalled()
  })
})
