import { useCallback, useEffect } from 'react'
import { useConfig } from '../store/configContext.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { scaleFactor } from '../../config/appConfig.js'
import eventBus from '../../services/eventBus.js'

export const useTargetMarker = () => {
  const { mapProvider } = useConfig()
  const { safeZoneInset } = useApp()
  const { targetMarker, dispatch, mapSize } = useMap()

  const updatePosition = (el, x, y) => {
    if (!safeZoneInset) {
      return
    }
    const scaled = { x: x * scaleFactor[mapSize], y: y * scaleFactor[mapSize] }
    el.style.transform = `translate(${scaled.x - safeZoneInset.left}px, ${scaled.y - safeZoneInset.top}px)`
    el.style.left = '0'
    el.style.top = '0'
    el.style.display = 'block'
  }

  const markerRef = useCallback(el => {
    if (!el) {
      return
    }

    // --- API ---
    
    targetMarker.pinToMap = (coords, state) => {
      const { x, y } = mapProvider.getPointFromCoords(coords)
      targetMarker.coords = coords
      dispatch({ type: 'UPDATE_TARGET_MARKER', payload: { isPinnedToMap: true, isVisible: true, coords: coords, state }})
      updatePosition(el, x, y, state)
    }

    targetMarker.fixAtCenter = (state) => {
      el.style.left = '50%'
      el.style.top = '50%'
      el.style.transform = 'translate(0,0)'
      el.style.display = 'block'
      dispatch({ type: 'UPDATE_TARGET_MARKER', payload: { isPinnedToMap: false, isVisible: true }})
    }

    targetMarker.remove = () => {
      el.style.display = 'none'
      dispatch({ type: 'UPDATE_TARGET_MARKER', payload: { isPinnedToMap: false, isVisible: false } })
    }

    targetMarker.show = () => {
      el.style.display = 'block'
      dispatch({ type: 'UPDATE_TARGET_MARKER', payload: { isVisible: true } })
    }

    targetMarker.hide = () => {
      el.style.display = 'none'
      dispatch({ type: 'UPDATE_TARGET_MARKER', payload: { isVisible: false } })
    }

    targetMarker.setStyle = (state) => {
      dispatch({ type: 'UPDATE_TARGET_MARKER', payload: { state } })
    }

    targetMarker.getDetail = () => {
      const coords = targetMarker.isPinnedToMap ? targetMarker.coords : mapProvider.getCenter()
      
      return {
        state: targetMarker.state,
        point: mapProvider.getPointFromCoords(coords),
        zoom: mapProvider.getZoom(),
        coords
      }
    }

    const handleRender = () => {
      if (targetMarker.coords && targetMarker.isPinnedToMap) {
        const { x, y } = mapProvider.getPointFromCoords(targetMarker.coords)
        updatePosition(el, x, y, targetMarker.state)
      }
    }

    eventBus.on('map:render', handleRender)

    return () => {
      eventBus.off('map:render', handleRender)
    }

  }, [targetMarker, mapProvider, mapSize, dispatch, safeZoneInset])

  useEffect(() => {
    if (targetMarker.coords && targetMarker.isPinnedToMap) {
      // Call again on size change
      targetMarker.pinToMap(targetMarker.coords, targetMarker.state)
    }
  }, [mapSize])

  return {
    targetMarker,
    markerRef
  }
}
