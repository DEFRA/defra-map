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

  it('does not setup API when not ready or no provider', () => {
    useMap.mockReturnValue({ locationMarkers: mockLocationMarkers, dispatch: mockDispatch, mapSize: 'medium', isMapReady: false })
    let { result } = renderHook(() => useLocationMarkers())
    expect(result.current.locationMarkers.add).toBeUndefined()
    
    useConfig.mockReturnValue({ mapProvider: null })
    useMap.mockReturnValue({ locationMarkers: mockLocationMarkers, dispatch: mockDispatch, mapSize: 'medium', isMapReady: true })
    result = renderHook(() => useLocationMarkers()).result
    expect(result.current.locationMarkers.add).toBeUndefined()
  })

  it('API methods work correctly', () => {
    const { result } = renderHook(() => useLocationMarkers())
    
    act(() => result.current.locationMarkers.add('m1', { lat: 5, lng: 10 }, { label: 'Test' }))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPSERT_LOCATION_MARKER',
      payload: { id: 'm1', coords: { lat: 5, lng: 10 }, label: 'Test', x: 200, y: 381, isVisible: true }
    })
    
    act(() => result.current.locationMarkers.remove('m1'))
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'REMOVE_LOCATION_MARKER', payload: 'm1' })
    
    mockLocationMarkers.items = [{ id: 'm1', label: 'First' }, { id: 'm2', label: 'Second' }]
    expect(result.current.locationMarkers.getMarker('m2')).toEqual({ id: 'm2', label: 'Second' })
  })

  it('markerRef stores and removes refs', () => {
    const { result } = renderHook(() => useLocationMarkers())
    const ref = result.current.markerRef('m1')
    
    act(() => ref(mockElement))
    expect(result.current.locationMarkers.markerRefs.get('m1')).toBe(mockElement)
    
    act(() => ref(null))
    expect(result.current.locationMarkers.markerRefs.has('m1')).toBe(false)
  })

  it('updates markers on map:render', () => {
    mockLocationMarkers.items = [{ id: 'm1', coords: { lat: 1, lng: 1 } }]
    const { result } = renderHook(() => useLocationMarkers())
    
    act(() => result.current.markerRef('m1')(mockElement))
    act(() => eventBus.on.mock.calls[0][1]())
    
    expect(mockElement.style).toMatchObject({ transform: 'translate(200px, 381px)', display: 'block' })
  })

  it('skips render when not ready or no provider', () => {
    mockLocationMarkers.items = [{ id: 'm1', coords: { lat: 1, lng: 1 } }]
    
    useMap.mockReturnValue({ locationMarkers: mockLocationMarkers, dispatch: mockDispatch, mapSize: 'medium', isMapReady: false })
    let { result } = renderHook(() => useLocationMarkers())
    act(() => result.current.markerRef('m1')(mockElement))
    act(() => eventBus.on.mock.calls[0][1]())
    expect(mockElement.style.transform).toBeUndefined()
    
    mockElement = { style: {} }
    useConfig.mockReturnValue({ mapProvider: null })
    useMap.mockReturnValue({ locationMarkers: mockLocationMarkers, dispatch: mockDispatch, mapSize: 'medium', isMapReady: true })
    result = renderHook(() => useLocationMarkers()).result
    act(() => result.current.markerRef('m1')(mockElement))
    act(() => eventBus.on.mock.calls[1][1]())
    expect(mockElement.style.transform).toBeUndefined()
  })

  it('skips marker without ref or coords', () => {
    mockLocationMarkers.items = [{ id: 'm1', coords: { lat: 1, lng: 1 } }, { id: 'm2', coords: null }]
    const { result } = renderHook(() => useLocationMarkers())
    
    act(() => result.current.markerRef('m1')(mockElement))
    act(() => eventBus.on.mock.calls[0][1]())
    
    expect(mockElement.style.transform).toBe('translate(200px, 381px)')
  })

  it('unsubscribes on cleanup', () => {
    const { result } = renderHook(() => useLocationMarkers())
    
    let cleanup
    act(() => { cleanup = result.current.markerRef('m1')(mockElement) })
    act(() => cleanup())
    
    expect(eventBus.off).toHaveBeenCalledWith('map:render', expect.any(Function))
  })

  it('updates positions on mapSize change', () => {
    mockLocationMarkers.items = [{ id: 'm1', coords: { lat: 1, lng: 1 } }]
    const { result, rerender } = renderHook(() => useLocationMarkers())
    
    act(() => result.current.markerRef('m1')(mockElement))
    
    useMap.mockReturnValue({ locationMarkers: mockLocationMarkers, dispatch: mockDispatch, mapSize: 'large', isMapReady: true })
    rerender()
    
    expect(mockElement.style.transform).toBe('translate(300px, 581px)')
  })

  it('skips mapSize update when not ready or no coords', () => {
    mockLocationMarkers.items = [{ id: 'm1', coords: { lat: 1, lng: 1 } }]
    const { result, rerender } = renderHook(() => useLocationMarkers())
    
    act(() => result.current.markerRef('m1')(mockElement))
    mockElement.style.transform = undefined
    
    useMap.mockReturnValue({ locationMarkers: mockLocationMarkers, dispatch: mockDispatch, mapSize: 'large', isMapReady: false })
    rerender()
    expect(mockElement.style.transform).toBeUndefined()
    
    mockLocationMarkers.items = [{ id: 'm1', coords: null }]
    useMap.mockReturnValue({ locationMarkers: mockLocationMarkers, dispatch: mockDispatch, mapSize: 'small', isMapReady: true })
    rerender()
    expect(mockElement.style.transform).toBeUndefined()
  })
})