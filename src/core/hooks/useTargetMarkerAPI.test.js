import { renderHook, act } from '@testing-library/react'
import { useTargetMarker } from './useTargetMarkerAPI'
import { useConfig } from '../store/configContext.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import eventBus from '../../services/eventBus.js'

jest.mock('../store/configContext.js')
jest.mock('../store/appContext.js')
jest.mock('../store/mapContext.js')
jest.mock('../../services/eventBus.js')
jest.mock('../../config/appConfig.js', () => ({ scaleFactor: { small: 1, medium: 2, large: 3 } }))

describe('useTargetMarker', () => {
  let mockMapProvider, mockDispatch, mockTargetMarker, mockElement

  beforeEach(() => {
    mockMapProvider = {
      getPointFromCoords: jest.fn(() => ({ x: 100, y: 200 })),
      getCenter: jest.fn(() => ({ lat: 0, lng: 0 })),
      getZoom: jest.fn(() => 10)
    }
    mockDispatch = jest.fn()
    mockTargetMarker = { coords: null, isPinnedToMap: false, state: 'default' }
    mockElement = { style: {} }
    eventBus.on = jest.fn()
    eventBus.off = jest.fn()
    
    useConfig.mockReturnValue({ mapProvider: mockMapProvider })
    useApp.mockReturnValue({ safeZoneInset: { left: 10, top: 20 } })
    useMap.mockReturnValue({ 
      targetMarker: mockTargetMarker, 
      dispatch: mockDispatch, 
      mapSize: 'medium' 
    })
  })

  const setup = () => {
    const hook = renderHook(() => useTargetMarker())
    act(() => hook.result.current.markerRef(mockElement))
    return hook
  }

  it('returns targetMarker and markerRef', () => {
    const { result } = renderHook(() => useTargetMarker())
    expect(result.current).toMatchObject({ targetMarker: mockTargetMarker, markerRef: expect.any(Function) })
  })

  it('handles null element', () => {
    const { result } = renderHook(() => useTargetMarker())
    act(() => result.current.markerRef(null))
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('returns early when no safeZoneInset', () => {
    useApp.mockReturnValue({ safeZoneInset: null })
    const { result } = renderHook(() => useTargetMarker())
    act(() => result.current.markerRef(mockElement))
    act(() => mockTargetMarker.pinToMap({ lat: 1, lng: 1 }))
    expect(mockElement.style.transform).toBeUndefined()
    expect(mockElement.style.display).toBeUndefined()
  })

  it('pinToMap updates position', () => {
    setup()
    act(() => mockTargetMarker.pinToMap({ lat: 1, lng: 1 }, 'active'))
    expect(mockElement.style.transform).toBe('translate(190px, 380px)')
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_TARGET_MARKER',
      payload: { isPinnedToMap: true, isVisible: true, coords: { lat: 1, lng: 1 }, state: 'active' }
    })
  })

  it('fixAtCenter centers marker', () => {
    setup()
    act(() => mockTargetMarker.fixAtCenter())
    expect(mockElement.style).toMatchObject({ left: '50%', top: '50%', transform: 'translate(0,0)' })
  })

  it('remove/show/hide toggle visibility', () => {
    setup()
    act(() => mockTargetMarker.remove())
    expect(mockElement.style.display).toBe('none')
    
    act(() => mockTargetMarker.show())
    expect(mockElement.style.display).toBe('block')
    
    act(() => mockTargetMarker.hide())
    expect(mockElement.style.display).toBe('none')
  })

  it('setStyle updates state', () => {
    setup()
    act(() => mockTargetMarker.setStyle('highlighted'))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_TARGET_MARKER',
      payload: { state: 'highlighted' }
    })
  })

  it('getDetail returns correct data for pinned/unpinned', () => {
    setup()
    
    mockTargetMarker.isPinnedToMap = true
    mockTargetMarker.coords = { lat: 5, lng: 10 }
    expect(mockTargetMarker.getDetail()).toMatchObject({ coords: { lat: 5, lng: 10 }, zoom: 10 })
    
    mockTargetMarker.isPinnedToMap = false
    expect(mockTargetMarker.getDetail()).toMatchObject({ coords: { lat: 0, lng: 0 } })
    expect(mockMapProvider.getCenter).toHaveBeenCalled()
  })

  it('subscribes and updates on map:render', () => {
    setup()
    expect(eventBus.on).toHaveBeenCalledWith('map:render', expect.any(Function))
    
    mockTargetMarker.coords = { lat: 1, lng: 1 }
    mockTargetMarker.isPinnedToMap = true
    
    act(() => eventBus.on.mock.calls[0][1]())
    expect(mockElement.style.transform).toBe('translate(190px, 380px)')
  })

  it('skips map:render update when not pinned', () => {
    setup()
    
    mockTargetMarker.coords = { lat: 1, lng: 1 }
    mockTargetMarker.isPinnedToMap = false
    
    const handleRender = eventBus.on.mock.calls[0][1]
    act(() => handleRender())
    
    expect(mockElement.style.transform).toBeUndefined()
  })

  it('unsubscribes on cleanup', () => {
    const { result } = renderHook(() => useTargetMarker())
    let cleanup
    act(() => { cleanup = result.current.markerRef(mockElement) })
    act(() => cleanup())
    expect(eventBus.off).toHaveBeenCalledWith('map:render', expect.any(Function))
  })

  it('re-pins on mapSize change', () => {
    const { rerender } = setup()
    
    mockTargetMarker.coords = { lat: 1, lng: 1 }
    mockTargetMarker.isPinnedToMap = true
    mockDispatch.mockClear()
    
    useMap.mockReturnValue({ targetMarker: mockTargetMarker, dispatch: mockDispatch, mapSize: 'large' })
    rerender()
    
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_TARGET_MARKER' }))
  })

  it('skips re-pin when not pinned', () => {
    const { rerender } = setup()
    mockDispatch.mockClear()
    
    useMap.mockReturnValue({ targetMarker: mockTargetMarker, dispatch: mockDispatch, mapSize: 'large' })
    rerender()
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})