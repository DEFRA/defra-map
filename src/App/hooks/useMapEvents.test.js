import { renderHook } from '@testing-library/react'
import { useMapEvents } from './useMapEvents'
import { useConfig } from '../store/configContext.js'
import eventBus from '../../services/eventBus.js'

jest.mock('../store/configContext.js')
jest.mock('../../services/eventBus.js')

describe('useMapEvents', () => {
  let mockMapProvider

  beforeEach(() => {
    mockMapProvider = {}
    eventBus.on = jest.fn()
    eventBus.off = jest.fn()
    useConfig.mockReturnValue({ mapProvider: mockMapProvider })
  })

  it('does nothing when no mapProvider (line 10)', () => {
    useConfig.mockReturnValue({ mapProvider: null })
    renderHook(() => useMapEvents({ 'test:event': jest.fn() }))

    expect(eventBus.on).not.toHaveBeenCalled()
  })

  it('registers event handlers when mapProvider exists', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const eventMap = {
      'map:click': callback1,
      'map:zoom': callback2
    }

    renderHook(() => useMapEvents(eventMap))

    expect(eventBus.on).toHaveBeenCalledTimes(2)
    expect(eventBus.on).toHaveBeenCalledWith('map:click', expect.any(Function))
    expect(eventBus.on).toHaveBeenCalledWith('map:zoom', expect.any(Function))
  })

  it('calls callbacks when events are triggered', () => {
    const callback = jest.fn()
    const eventMap = { 'map:click': callback }

    renderHook(() => useMapEvents(eventMap))

    const handler = eventBus.on.mock.calls[0][1]
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

    const handler1 = eventBus.on.mock.calls[0][1]
    const handler2 = eventBus.on.mock.calls[1][1]

    unmount()

    expect(eventBus.off).toHaveBeenCalledWith('map:click', handler1)
    expect(eventBus.off).toHaveBeenCalledWith('map:zoom', handler2)
  })

  it('re-registers handlers when eventMap changes', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    const { rerender } = renderHook(
      ({ eventMap }) => useMapEvents(eventMap),
      { initialProps: { eventMap: { 'map:click': callback1 } } }
    )

    expect(eventBus.on).toHaveBeenCalledTimes(1)

    rerender({ eventMap: { 'map:zoom': callback2 } })

    expect(eventBus.off).toHaveBeenCalledTimes(1)
    expect(eventBus.on).toHaveBeenCalledTimes(2)
    expect(eventBus.on).toHaveBeenCalledWith('map:zoom', expect.any(Function))
  })

  it('handles empty eventMap', () => {
    renderHook(() => useMapEvents({}))

    expect(eventBus.on).not.toHaveBeenCalled()
  })

  it('handles undefined eventMap (default parameter)', () => {
    renderHook(() => useMapEvents())

    expect(eventBus.on).not.toHaveBeenCalled()
  })
})
