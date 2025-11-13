import { useEffect, useRef } from 'react'
import { useConfig } from '../store/configContext.js'
import { useMap } from '../store/mapContext.js'
import eventBus from '../../services/eventBus.js'

export function useMapStateSync () {
  const { mapProvider } = useConfig()
  const { dispatch } = useMap()
  const previousState = useRef(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!mapProvider) {
      return
    }

    // Handle map move
    const handleMapMove = (payload) => {
      dispatch({
        type: 'MAP_MOVE',
        payload
      })
    }

    // Handle map moveend
    const handleMapMoveEnd = (payload) => {
      // Update React state
      dispatch({
        type: 'MAP_MOVE_END',
        payload
      })

      // Emit event with both previous and current state for other hooks
      eventBus.emit('map:stateupdated', {
        previous: previousState.current,
        current: payload
      })

      // Update previous state for next comparison
      previousState.current = payload
    }

    // Capture initial state when map is idle (first time only)
    const handleMapFirstIdle = (payload) => {
      if (!hasInitialized.current) {
        previousState.current = {
          center: mapProvider.getCenter(),
          zoom: mapProvider.getZoom()
        }
        hasInitialized.current = true
      }

      dispatch({
        type: 'MAP_FIRST_IDLE',
        payload
      })
    }

    // Listen to map events
    eventBus.on('map:move', handleMapMove)
    eventBus.on('map:moveend', handleMapMoveEnd)
    eventBus.on('map:firstidle', handleMapFirstIdle)

    return () => {
      eventBus.off('map:move', handleMapMove)
      eventBus.off('map:moveend', handleMapMoveEnd)
      eventBus.off('map:firstidle', handleMapFirstIdle)
    }
  }, [mapProvider, dispatch])
}
