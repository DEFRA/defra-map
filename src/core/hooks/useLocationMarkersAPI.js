import { useCallback, useEffect, useRef } from 'react'
import { useConfig } from '../store/configContext.js'
import { useMap } from '../store/mapContext.js'
import { scaleFactor } from '../../config/appConfig.js'
import eventBus from '../../services/eventBus.js'

export const useLocationMarkers = () => {
  const { mapProvider } = useConfig()
  const { locationMarkers, dispatch, mapSize, isMapReady } = useMap()

  // Map of DOM refs by marker id
  const markerRefs = useRef(new Map())

  // Convert map coords to scaled screen coordinates
  const projectCoords = useCallback((coords) => {
    if (!mapProvider || !isMapReady) {
      return { x: 0, y: 0 }
    }
    const { x, y } = mapProvider.getPointFromCoords(coords)
    return { x: x * scaleFactor[mapSize], y: y * scaleFactor[mapSize] - 19 }
  }, [mapProvider, mapSize, isMapReady])

  // --- API: Attach methods to locationMarkers obect ---
  useEffect(() => {
    if (!isMapReady || !mapProvider) {
      return
    }

    locationMarkers.markerRefs = markerRefs.current

    locationMarkers.add = (id, coords) => {
      const { x, y } = projectCoords(coords)
      dispatch({ type: 'UPSERT_LOCATION_MARKER', payload: { id, coords, x, y, isVisible: true }})
    }

    locationMarkers.remove = (id) => {
      dispatch({ type: 'REMOVE_LOCATION_MARKER', payload: id })
    }

    locationMarkers.getMarker = (id) => {
      return locationMarkers.items.find(marker => marker.id === id)
    }

  }, [isMapReady, mapProvider, locationMarkers, projectCoords, dispatch])

  // Single ref callback for each marker
  const markerRef = useCallback((id) => (el) => {
    if (!el) {
      markerRefs.current.delete(id)
      return
    }
    markerRefs.current.set(id, el)

    // Update marker positions on map render
    const handleRender = () => {
      if (!isMapReady || !mapProvider) {
        return
      }
      locationMarkers.items.forEach(marker => {
        const ref = markerRefs.current.get(marker.id)
        if (!ref || !marker.coords) {
          return
        }
        const { x, y } = projectCoords(marker.coords)
        ref.style.transform = `translate(${x}px, ${y}px)`
        ref.style.display = 'block'
      })
    }

    eventBus.on('map:render', handleRender)
    return () => eventBus.off('map:render', handleRender)
  }, [locationMarkers, projectCoords, mapProvider, isMapReady])

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
      const { x, y } = projectCoords(marker.coords)
      ref.style.transform = `translate(${x}px, ${y}px)`
    })
  }, [mapSize, locationMarkers.items, projectCoords, mapProvider, isMapReady])

  return {
    locationMarkers,
    markerRef
  }
}