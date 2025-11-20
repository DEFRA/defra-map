import { renderHook, act } from '@testing-library/react'
import { useLocationMarkers, projectCoords } from './useLocationMarkersAPI'
import { useConfig } from '../store/configContext.js'
import { useMap } from '../store/mapContext.js'
import eventBus from '../../services/eventBus.js'

jest.mock('../store/configContext.js')
jest.mock('../store/mapContext.js')
jest.mock('../../services/eventBus.js')
jest.mock('../../config/appConfig.js', () => ({ scaleFactor: { small: 1, medium: 2, large: 3 } }))

describe('projectCoords', () => {
  const mockProvider = { getPointFromCoords: jest.fn(() => ({ x: 100, y: 200 })) }

  it('returns scaled coordinates when ready', () => {
    expect(projectCoords({ lat: 1, lng: 1 }, mockProvider, 'medium', true)).toEqual({ x: 200, y: 381 })
  })

  it('returns zero when not ready or no provider', () => {
    expect(projectCoords({ lat: 1, lng: 1 }, mockProvider, 'medium', false)).toEqual({ x: 0, y: 0 })
    expect(projectCoords({ lat: 1, lng: 1 }, null, 'medium', true)).toEqual({ x: 0, y: 0 })
    expect(projectCoords({ lat: 1, lng: 1 }, null, 'medium', false)).toEqual({ x: 0, y: 0 })
  })
})

describe('useLocationMarkers', () => {
  let mockMapProvider, mockDispatch, mockLocationMarkers, mockElement

  beforeEach(() => {
    mockMapProvider = { getPointFromCoords: jest.fn(() => ({ x: 100, y: 200 })) }
    mockDispatch = jest.fn()
    mockLocationMarkers = { items: [] }
    mockElement = { style: {} }

    eventBus.on = jest.fn()
    eventBus.off = jest.fn()

    useConfig.mockReturnValue({ mapProvider: mockMapProvider })
    useMap.mockReturnValue({
      locationMarkers: mockLocationMarkers,
      dispatch: mockDispatch,
      mapSize: 'medium',
      isMapReady: true
    })
  })

  it('returns locationMarkers and markerRef', () => {
    const { result } = renderHook(() => useLocationMarkers())
    expect(result.current).toMatchObject({ locationMarkers: mockLocationMarkers, markerRef: expect.any(Function) })
  })

  it('getMarker returns correct marker', () => {
    mockLocationMarkers.items = [{ id: 'm1', label: 'First' }, { id: 'm2', label: 'Second' }]
    const { result } = renderHook(() => useLocationMarkers())

    // Found
    expect(result.current.locationMarkers.getMarker('m2')).toEqual({ id: 'm2', label: 'Second' })
    // Not found
    expect(result.current.locationMarkers.getMarker('nonexistent')).toBeUndefined()
  })

  it('markerRef stores and removes refs (line 54)', () => {
    const { result } = renderHook(() => useLocationMarkers())
    const ref = result.current.markerRef('m1')

    act(() => ref(mockElement))
    expect(result.current.locationMarkers.markerRefs.get('m1')).toBe(mockElement)

    act(() => ref(null)) // line 54 early return
    expect(result.current.locationMarkers.markerRefs.has('m1')).toBe(false)
  })

  it('updateMarkers skips missing coords or ref (line 71)', () => {
    mockLocationMarkers.items = [
      { id: 'm1', coords: { lat: 1, lng: 1 } },
      { id: 'm2', coords: null }, // line 71: missing coords
      { id: 'm3', coords: { lat: 0, lng: 0 } } // line 71: missing ref
    ]
    const { result } = renderHook(() => useLocationMarkers())
    act(() => result.current.markerRef('m1')(mockElement))

    const renderCallback = eventBus.on.mock.calls.find(call => call[0] === 'map:render')[1]
    act(() => renderCallback())
    expect(mockElement.style.transform).toBe('translate(200px, 381px)')
  })

  it('skips map:render when not ready or no provider (line 60)', () => {
    useMap.mockReturnValue({ locationMarkers: mockLocationMarkers, dispatch: mockDispatch, mapSize: 'medium', isMapReady: false })
    const { result } = renderHook(() => useLocationMarkers())
    act(() => result.current.markerRef('m1')(mockElement))
    
    const renderCallback = eventBus.on.mock.calls.find(call => call[0] === 'map:render')?.[1]
    if (renderCallback) act(() => renderCallback()) // line 60: early return
  })

  it('updates positions on mapSize change', () => {
    mockLocationMarkers.items = [{ id: 'm1', coords: { lat: 1, lng: 1 } }]
    const { result, rerender } = renderHook(() => useLocationMarkers())
    act(() => result.current.markerRef('m1')(mockElement))

    useMap.mockReturnValue({
      locationMarkers: mockLocationMarkers,
      dispatch: mockDispatch,
      mapSize: 'large',
      isMapReady: true
    })
    rerender()
    expect(mockElement.style.transform).toBe('translate(300px, 581px)')
  })

  it('handles app:addlocationmarker safely', () => {
    renderHook(() => useLocationMarkers())
    const addPayload = { id: 'm1', coords: { lat: 1, lng: 1 }, options: { label: 'Test' } }

    const callback = eventBus.on.mock.calls.find(call => call[0] === 'app:addlocationmarker')[1]
    act(() => callback(addPayload))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPSERT_LOCATION_MARKER',
      payload: { id: 'm1', coords: { lat: 1, lng: 1 }, label: 'Test', x: 200, y: 381, isVisible: true }
    })
  })

  it('does not crash on undefined/null payload', () => {
    renderHook(() => useLocationMarkers())
    const callback = eventBus.on.mock.calls.find(call => call[0] === 'app:addlocationmarker')[1]

    act(() => callback(undefined))
    act(() => callback(null))
    act(() => callback({})) // missing id
    act(() => callback({ id: 'm1' })) // missing coords
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('handles app:removelocationmarker safely (guard)', () => {
    renderHook(() => useLocationMarkers())
    const callback = eventBus.on.mock.calls.find(call => call[0] === 'app:removelocationmarker')[1]

    act(() => callback('m1')) // valid id
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'REMOVE_LOCATION_MARKER', payload: 'm1' })

    act(() => callback(undefined)) // guard triggers
    act(() => callback(null))
    expect(mockDispatch).toHaveBeenCalledTimes(1)
  })

  it('cleans up map:render listener on unmount', () => {
    const { result, unmount } = renderHook(() => useLocationMarkers())
    
    let cleanup
    act(() => { cleanup = result.current.markerRef('m1')(mockElement) })

    const updateCallback = eventBus.on.mock.calls.find(call => call[0] === 'map:render')[1]
    act(() => { if (cleanup) cleanup() })

    expect(eventBus.off).toHaveBeenCalledWith('map:render', updateCallback)
  })

  it('cleans up eventBus listeners on unmount', () => {
    const { unmount } = renderHook(() => useLocationMarkers())
    
    // Get the registered callbacks
    const addCallback = eventBus.on.mock.calls.find(call => call[0] === 'app:addlocationmarker')[1]
    const removeCallback = eventBus.on.mock.calls.find(call => call[0] === 'app:removelocationmarker')[1]

    unmount()

    // Verify both listeners were removed
    expect(eventBus.off).toHaveBeenCalledWith('app:addlocationmarker', addCallback)
    expect(eventBus.off).toHaveBeenCalledWith('app:removelocationmarker', removeCallback)
  })
})