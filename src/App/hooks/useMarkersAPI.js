import { useCallback, useEffect, useRef } from 'react'
import { useConfig } from '../store/configContext.js'
import { useMap } from '../store/mapContext.js'
import { useService } from '../store/serviceContext.js'
import { scaleFactor } from '../../config/appConfig.js'
import { EVENTS as events } from '../../config/events.js'
// import eventBus from '../../services/eventBus.js'

// Pure function - easier to test
export const projectCoords = (coords, mapProvider, mapSize, isMapReady) => {
  if (!mapProvider || !isMapReady) {
    return { x: 0, y: 0 }
  }
  const { x, y } = mapProvider.getPointFromCoords(coords)
  return { x: x * scaleFactor[mapSize], y: y * scaleFactor[mapSize] - 19 }
}

export const useMarkers = () => {
  const { mapProvider } = useConfig()
  const { eventBus } = useService()
  const { markers, dispatch, mapSize, isMapReady } = useMap()
  const markerRefs = useRef(new Map())

  // --- API: Attach methods to markers object ---
  useEffect(() => {
    if (!mapProvider) {
      return
    }

    markers.markerRefs = markerRefs.current

    markers.add = (id, coords, options) => {
      const { x, y } = projectCoords(coords, mapProvider, mapSize, isMapReady)
      dispatch({ type: 'UPSERT_LOCATION_MARKER', payload: { id, coords, ...options, x, y, isVisible: true } })
    }

    markers.remove = (id) => {
      dispatch({ type: 'REMOVE_LOCATION_MARKER', payload: id })
    }

    markers.getMarker = (id) => {
      return markers.items.find(marker => marker.id === id)
    }
  }, [mapProvider, markers, dispatch, mapSize])

  // Update marker position on events.MAP_RENDER
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

      markers.items.forEach(marker => {
        const ref = markerRefs.current.get(marker.id)
        if (!ref || !marker.coords) {
          return
        }

        const { x, y } = projectCoords(marker.coords, mapProvider, mapSize, isMapReady)
        ref.style.transform = `translate(${x}px, ${y}px)`
        ref.style.display = 'block'
      })
    }
    eventBus.on(events.MAP_RENDER, updateMarkers)

    return () => {
      eventBus.off(events.MAP_RENDER, updateMarkers)
    }
  }, [markers, mapProvider, isMapReady, mapSize])

  // Update all markers on map resize
  useEffect(() => {
    if (!isMapReady || !mapProvider) {
      return
    }

    markers.items.forEach(marker => {
      const ref = markerRefs.current.get(marker.id)
      if (!ref || !marker.coords) {
        return
      }

      const { x, y } = projectCoords(marker.coords, mapProvider, mapSize, isMapReady)
      ref.style.transform = `translate(${x}px, ${y}px)`
    })
  }, [mapSize, markers.items, mapProvider, isMapReady])

  // Respond to external API calls via eventBus
  useEffect(() => {
    const handleAddMarker = (payload = {}) => {
      if (!payload || !payload.id || !payload.coords) {
        return
      }
      const { id, coords, options } = payload
      markers.add(id, coords, options)
    }
    eventBus.on(events.APP_ADD_MARKER, handleAddMarker)

    const handleRemoveMarker = (id) => {
      if (!id) {
        return
      }
      markers.remove(id)
    }
    eventBus.on(events.APP_REMOVE_MARKER, handleRemoveMarker)

    return () => {
      eventBus.off(events.APP_ADD_MARKER, handleAddMarker)
      eventBus.off(events.APP_REMOVE_MARKER, handleRemoveMarker)
    }
  }, [])

  return { markers, markerRef }
}
