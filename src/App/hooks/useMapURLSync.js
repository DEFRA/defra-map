import { useEffect } from 'react'
import { setMapStateInURL } from '../../utils/mapStateSync.js'
import { useConfig } from '../store/configContext.js'
import { useService } from '../store/serviceContext.js'
import { EVENTS as events } from '../../config/events.js'
// import eventBus from '../../services/eventBus.js'

export function useMapURLSync () {
  const { id } = useConfig()
  const { eventBus } = useService()

  useEffect(() => {
    if (!id) {
      return
    }

    const handleStateUpdate = ({ current }) => {
      setMapStateInURL(id, {
        center: current.center,
        zoom: current.zoom
      })
    }

    eventBus.on(events.MAP_STATE_UPDATED, handleStateUpdate)
    return () => eventBus.off(events.MAP_STATE_UPDATED, handleStateUpdate)
  }, [id])
}
