// src/core/hooks/useMapAnnouncements.js
import { useEffect } from 'react'
import { useConfig } from '../store/configContext.js'
import { useService } from '../store/serviceContext.js'
import { getMapStatusMessage } from '../../utils/getMapStatusMessage.js'
import { EVENTS as events } from '../../config/events.js'

export function useMapAnnouncements () {
  const { mapProvider } = useConfig()
  const { eventBus, announce } = useService()

  useEffect(() => {
    const handleAnnounceStateUpdate = ({ previous, current }) => {
      if (!previous?.center || !current?.center) {
        return
      }

      const zoomChanged = previous.zoom !== current.zoom
      const centerChanged =
        previous.center[0] !== current.center[0] ||
        previous.center[1] !== current.center[1]

      const areaDimensions = mapProvider.getAreaDimensions()
      let message

      if (centerChanged && !zoomChanged) {
        const direction = mapProvider.getCardinalMove(previous.center, current.center)
        message = getMapStatusMessage.moved({
          direction,
          areaDimensions
        })
      } else if (!centerChanged && zoomChanged) {
        message = getMapStatusMessage.zoomed({
          ...current,
          from: previous.zoom,
          to: current.zoom,
          areaDimensions
        })
      } else if (!centerChanged && !zoomChanged) {
        message = getMapStatusMessage.noChange({
          ...current
        })
      } else {
        message = getMapStatusMessage.newArea({
          ...current,
          areaDimensions
        })
      }

      if (message) {
        announce(message, 'core')
      }
    }

    eventBus.on(events.MAP_STATE_UPDATED, handleAnnounceStateUpdate)

    return () => {
      eventBus.off(events.MAP_STATE_UPDATED, handleAnnounceStateUpdate)
    }
  }, [mapProvider, announce])
}
