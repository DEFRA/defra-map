import { useCallback, useEffect, useRef } from 'react'
import { useConfig } from '../store/configContext.js'
import { useMap } from '../store/mapContext.js'
import { scaleFactor } from '../../config/appConfig.js'
import eventBus from '../../services/eventBus.js'

// Pure function - easier to test
export const projectCoords = (coords, mapProvider, mapSize, isMapReady) => {
  if (!mapProvider || !isMapReady) {
    return { x: 0, y: 0 }
  }
  const { x, y } = mapProvider.getPointFromCoords(coords)
  return { x: x * scaleFactor[mapSize], y: y * scaleFactor[mapSize] - 19 }
}

export const useLocationMarkers = () => {
  const { mapProvider } = useConfig()
  const { locationMarkers, dispatch, mapSize, isMapReady } = useMap()
  const markerRefs = useRef(new Map())

  // --- API: Attach methods to locationMarkers object ---
  useEffect(() => {
    if (!isMapReady || !mapProvider) {
      return
    }

    locationMarkers.markerRefs = markerRefs.current

    locationMarkers.add = (id, coords, options) => {
      const { x, y } = projectCoords(coords, mapProvider, mapSize, isMapReady)
      dispatch({ type: 'UPSERT_LOCATION_MARKER', payload: { id, coords, ...options, x, y, isVisible: true }})
    }

    locationMarkers.remove = (id) => {
      dispatch({ type: 'REMOVE_LOCATION_MARKER', payload: id })
    }

    locationMarkers.getMarker = (id) => {
      return locationMarkers.items.find(marker => marker.id === id)
    }

  }, [isMapReady, mapProvider, locationMarkers, dispatch, mapSize])

  // Single ref callback for each marker
  const markerRef = useCallback((id) => (el) => {
    if (!el) {
      markerRefs.current.delete(id)
      return
    }
    markerRefs.current.set(id, el)

    const updateMarkers = () => {
      if (!isMapReady || !mapProvider) {
        return
      }
      
      locationMarkers.items.forEach(marker => {
        const ref = markerRefs.current.get(marker.id)
        if (!ref || !marker.coords) {
          return
        }
        
        const { x, y } = projectCoords(marker.coords, mapProvider, mapSize, isMapReady)
        ref.style.transform = `translate(${x}px, ${y}px)`
        ref.style.display = 'block'
      })
    }

    eventBus.on('map:render', updateMarkers)
    return () => eventBus.off('map:render', updateMarkers)
  }, [locationMarkers, mapProvider, isMapReady, mapSize])

  // Update all markers on map resize
  useEffect(() => {
    if (!isMapReady || !mapProvider) {
      return
    }
    
    locationMarkers.items.forEach(marker => {
      const ref = markerRefs.current.get(marker.id)
      if (!ref || !marker.coords) {
        return
      }
      
      const { x, y } = projectCoords(marker.coords, mapProvider, mapSize, isMapReady)
      ref.style.transform = `translate(${x}px, ${y}px)`
    })
  }, [mapSize, locationMarkers.items, mapProvider, isMapReady])

  return { locationMarkers, markerRef }
}