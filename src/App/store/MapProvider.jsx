// src/core/store/MapProvider.jsx
import React, { createContext, useEffect, useReducer, useMemo } from 'react'
import { initialState, reducer } from './mapReducer.js'
import eventBus from '../../services/eventBus.js'

export const MapContext = createContext(null)

export const MapProvider = ({ options, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState(options))

  const handleMapReady = () => {
    dispatch({ type: 'SET_MAP_READY' })
  }

  const handleInitMapStyles = (mapStyles) => {
    const savedMapStyleId = localStorage.getItem(`${options.id}:mapStyleId`)
    const mapStyle = mapStyles.find(s => s.id === savedMapStyleId) || mapStyles[0]
    const savedMapSize = localStorage.getItem(`${options.id}:mapSize`)
    const mapSize = savedMapSize || options.mapSize
    dispatch({ type: 'SET_MAP_STYLE', payload: mapStyle })
    dispatch({ type: 'SET_MAP_SIZE', payload: mapSize })
  }

  const handleSetMapStyle = (mapStyle) => {
    dispatch({ type: 'SET_MAP_STYLE', payload: mapStyle })
  }

  const handleSetMapSize = (mapSize) => {
    dispatch({ type: 'SET_MAP_SIZE', payload: mapSize })
  }

  // Listen to eventBus and update state
  useEffect(() => {
    eventBus.on('map:ready', handleMapReady)
    eventBus.on('map:initmapstyles', handleInitMapStyles)
    eventBus.on('map:setmapstyle', handleSetMapStyle)
    eventBus.on('map:setmapsize', handleSetMapSize)

    return () => {
      eventBus.off('map:ready', handleMapReady)
      eventBus.off('map:initmapstyles', handleInitMapStyles)
      eventBus.off('map:setmapstyle', handleSetMapStyle)
      eventBus.off('map:setmapsize', handleSetMapSize)
    }
  }, [])

  // Persist mapStyle and mapSize in localStorage
  useEffect(() => {
    if (!state.mapStyle || !state.mapSize) {
      return
    }
    localStorage.setItem(`${options.id}:mapStyleId`, state.mapStyle.id)
    localStorage.setItem(`${options.id}:mapSize`, state.mapSize)
  }, [state.mapStyle, state.mapSize])

  const mapStore = useMemo(() => ({
    ...state,
    dispatch
  }), [state])

  return (
    <MapContext.Provider value={mapStore}>
      {children}
    </MapContext.Provider>
  )
}
