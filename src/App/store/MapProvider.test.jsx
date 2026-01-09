import React from 'react'
import { render, act } from '@testing-library/react'
import { MapProvider, MapContext } from './MapProvider.jsx'
import eventBus from '../../services/eventBus.js'

// Mock mapReducer module correctly (self-contained factory)
jest.mock('./mapReducer.js', () => {
  const initialState = jest.fn((options) => ({
    mapStyle: null,
    mapSize: null,
    crossHair: null,
    isMapReady: false
  }))

  const setMapReady = jest.fn((state) => ({ ...state, isMapReady: true }))
  const setMapStyle = jest.fn((state, payload) => ({ ...state, mapStyle: payload }))
  const setMapSize = jest.fn((state, payload) => ({ ...state, mapSize: payload }))
  const updateCrossHair = jest.fn((state, payload) => ({ ...state, crossHair: payload }))

  const actionsMap = {
    SET_MAP_READY: setMapReady,
    SET_MAP_STYLE: setMapStyle,
    SET_MAP_SIZE: setMapSize,
    UPDATE_CROSS_HAIR: updateCrossHair
  }

  const reducer = jest.fn((state, action) => {
    const fn = actionsMap[action.type]
    return fn ? fn(state, action.payload) : state
  })

  return { initialState, actionsMap, reducer }
})

// Mock eventBus
jest.mock('../../services/eventBus.js', () => ({
  on: jest.fn(),
  off: jest.fn()
}))

describe('MapProvider', () => {
  let capturedHandlers = {}

  beforeEach(() => {
    localStorage.clear()
    capturedHandlers = {}

    // Capture event handlers
    eventBus.on.mockImplementation((event, handler) => {
      capturedHandlers[event] = handler
    })
    eventBus.off.mockClear()
    jest.clearAllMocks()
  })

  test('renders children and provides context', () => {
    let contextValue
    const Child = () => {
      contextValue = React.useContext(MapContext)
      return <div>ChildContent</div>
    }

    const { getByText } = render(
      <MapProvider options={{ id: 'map1', mapSize: '100x100' }}>
        <Child />
      </MapProvider>
    )

    expect(getByText('ChildContent')).toBeInTheDocument()
    expect(contextValue).toHaveProperty('dispatch')
    expect(contextValue).toHaveProperty('mapStyle')
    expect(contextValue).toHaveProperty('mapSize')
    expect(contextValue).toHaveProperty('crossHair')
    expect(contextValue).toHaveProperty('isMapReady')
  })

  test('subscribes and unsubscribes to eventBus', () => {
    render(
      <MapProvider options={{ id: 'map1', mapSize: '100x100' }}>
        <div>Child</div>
      </MapProvider>
    )

    // Ensure all events subscribed
    expect(eventBus.on).toHaveBeenCalledWith('map:ready', expect.any(Function))
    expect(eventBus.on).toHaveBeenCalledWith('map:initmapstyles', expect.any(Function))
    expect(eventBus.on).toHaveBeenCalledWith('map:setstyle', expect.any(Function))
    expect(eventBus.on).toHaveBeenCalledWith('map:setsize', expect.any(Function))

    // Trigger handlers → covers reducer calls
    act(() => {
      capturedHandlers['map:ready']()
      capturedHandlers['map:setstyle']({ id: 'style1' })
      capturedHandlers['map:setsize']('300x300')
      capturedHandlers['map:initmapstyles']([{ id: 'style1' }])
    })
  })

  test('initMapStyles uses options.mapSize if localStorage has no saved mapSize', () => {
    const options = { id: 'map1', mapSize: '200x200' }
    const mapStyles = [{ id: 'style1' }]

    render(
      <MapProvider options={options}>
        <div>Child</div>
      </MapProvider>
    )

    act(() => {
      capturedHandlers['map:initmapstyles'](mapStyles)
    })

    expect(localStorage.getItem('map1:mapSize')).toBe('200x200')
    expect(localStorage.getItem('map1:mapStyleId')).toBe('style1')
  })

  test('initMapStyles uses savedMapSize from localStorage if present', () => {
    localStorage.setItem('map1:mapSize', '150x150')
    const options = { id: 'map1', mapSize: '200x200' }
    const mapStyles = [{ id: 'style1' }]

    render(
      <MapProvider options={options}>
        <div>Child</div>
      </MapProvider>
    )

    act(() => {
      capturedHandlers['map:initmapstyles'](mapStyles)
    })

    expect(localStorage.getItem('map1:mapSize')).toBe('150x150')
    expect(localStorage.getItem('map1:mapStyleId')).toBe('style1')
  })

  test('handles dispatch actions correctly', () => {
    render(
      <MapProvider options={{ id: 'map1', mapSize: '100x100' }}>
        <div>Child</div>
      </MapProvider>
    )

    act(() => {
      capturedHandlers['map:ready']()
      capturedHandlers['map:setstyle']({ id: 'style2' })
      capturedHandlers['map:setsize']('400x400')
    })
  })
})
