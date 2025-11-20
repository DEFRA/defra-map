import { renderHook, act } from '@testing-library/react'
import { useMapURLSync } from './useMapURLSync'
import { useConfig } from '../store/configContext.js'
import eventBus from '../../services/eventBus.js'
import * as mapStateSync from '../../utils/mapStateSync.js'

jest.mock('../store/configContext.js')
jest.mock('../../services/eventBus.js')
jest.mock('../../utils/mapStateSync.js')

describe('useMapURLSync', () => {
  let handleEvent

  beforeEach(() => {
    handleEvent = undefined
    eventBus.on = jest.fn((event, fn) => { handleEvent = fn })
    eventBus.off = jest.fn()
    mapStateSync.setMapStateInURL = jest.fn()
  })

  it('registers map:stateupdated listener and cleans up', () => {
    useConfig.mockReturnValue({ id: 'map123' })

    const { unmount } = renderHook(() => useMapURLSync())
    expect(eventBus.on).toHaveBeenCalledWith('map:stateupdated', expect.any(Function))

    unmount()
    expect(eventBus.off).toHaveBeenCalledWith('map:stateupdated', handleEvent)
  })

  it('calls setMapStateInURL on map:stateupdated', () => {
    useConfig.mockReturnValue({ id: 'map123' })

    renderHook(() => useMapURLSync())

    act(() => {
      handleEvent({ current: { center: [1, 2], zoom: 5 } })
    })

    expect(mapStateSync.setMapStateInURL).toHaveBeenCalledWith('map123', {
      center: [1, 2],
      zoom: 5
    })
  })

  it('does nothing if id is falsy', () => {
    useConfig.mockReturnValue({ id: null })

    const { unmount } = renderHook(() => useMapURLSync())
    expect(eventBus.on).not.toHaveBeenCalled()
    expect(eventBus.off).not.toHaveBeenCalled()

    unmount() // cleanup should not throw
  })
})
