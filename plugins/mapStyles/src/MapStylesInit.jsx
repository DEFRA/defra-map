// src/plugins/mapStyles/MapStylesInit.jsx
import { useEffect } from 'react'

export function MapStylesInit ({ pluginConfig, services }) {
  const { eventBus } = services

  const handler = () => {
    eventBus.emit('map:initmapstyles', pluginConfig.mapStyles)
  }

  useEffect(() => {
    eventBus.on('app:ready', handler)

    return () => eventBus.off('map:ready', handler)
  }, [])

  return null // no UI output, just side effects
}
