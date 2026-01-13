import { useEffect } from 'react'
import { useConfig } from '../store/configContext.js'
import { useService } from '../store/serviceContext.js'
// import eventBus from '../../services/eventBus.js'

export function useMapEvents (eventMap = {}) {
  const { mapProvider } = useConfig()
  const { eventBus } = useService()

  useEffect(() => {
    if (!mapProvider) {
      return
    }

    const handlers = {}

    Object.entries(eventMap).forEach(([eventName, callback]) => {
      const handler = (event) => callback(event)
      handlers[eventName] = handler
      eventBus.on(eventName, handler)
    })

    return () => {
      Object.entries(handlers).forEach(([eventName, handler]) => {
        eventBus.off(eventName, handler)
      })
    }
  }, [mapProvider, eventMap])
}
