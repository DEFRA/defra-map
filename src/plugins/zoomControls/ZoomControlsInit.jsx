// src/plugins/zoomControls/zoomControlsInit.jsx
import { useEffect } from 'react'
import { attachEvents } from './events.js'

export function ZoomControlsInit ({
  appConfig,
  appState,
  mapState,
  services,
  mapProvider,
  buttonConfig
}) {
  const { zoomIn: zoomInButton, zoomOut: zoomOutButton } = buttonConfig
  const { isAtMaxZoom, isAtMinZoom } = mapState
  const { zoomDelta, nudgeZoomDelta } = appConfig

  // Attach events when component mounts
  useEffect(() => {
    attachEvents({
      mapProvider,
      zoomInButton,
      zoomOutButton,
      zoomDelta,
      nudgeZoomDelta
    })

    return () => {
      zoomInButton.onClick = null
      zoomOutButton.onClick = null
    }
  }, [mapProvider, zoomInButton, zoomOutButton])

  // Toggle disabled state
  useEffect(() => {
    appState.dispatch({
      type: 'TOGGLE_BUTTON_DISABLED',
      payload: { id: 'zoomIn', isDisabled: isAtMaxZoom }
    })
    appState.dispatch({
      type: 'TOGGLE_BUTTON_DISABLED',
      payload: { id: 'zoomOut', isDisabled: isAtMinZoom }
    })
  }, [isAtMaxZoom, isAtMinZoom])

  return null
}
