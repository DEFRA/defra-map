// src/plugins/menuDataLayers/MenuDataLayersInit.jsx
import { useEffect } from 'react'

export function MenuDataLayersInit ({ pluginState, appState, mapState, services }) {
  const { eventBus } = services

  useEffect(() => {
    eventBus.on('search:open', () => {
      appState.dispatch({ type: 'CLOSE_PANEL', payload: 'menuDataLayers' })
    })

    eventBus.on('search:close', () => {
      // appState.dispatch({ type: 'RESTORE_PREVIOUS_PANELS' })
    })

    eventBus.on('drawpolygon:cancel', () => {
      appState.dispatch({ type: 'REVERT_MODE' })
    })

    return () => {
      eventBus.off('drawpolygon:cancel')
      eventBus.off('search:open')
      eventBus.off('search:close')
    }
  }, [appState, mapState])

  return null // no UI output, just side effects
}
