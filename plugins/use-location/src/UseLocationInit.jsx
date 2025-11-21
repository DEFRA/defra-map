// src/plugins/zoomControls/zoomControlsInit.jsx
import { useEffect } from 'react'
import { attachEvents } from './events.js'

export function UseLocationInit ({ appState, pluginState, mapProvider, buttonConfig }) {
  const { useLocation: useLocationButton } = buttonConfig

  // Attach events when component mounts
  useEffect(() => {
    attachEvents({
      appState,
      pluginState,
      mapProvider,
      useLocationButton
    })

    return () => {
      useLocationButton.onClick = null
    }
  }, [mapProvider, useLocationButton])

  return null
}
