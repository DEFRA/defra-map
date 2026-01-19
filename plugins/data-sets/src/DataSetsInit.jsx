// src/plugins/dataSets/dataSetsInit.jsx
import { useEffect, useRef } from 'react'
import { createDataSets } from './dataSets.js'

export function DataSetsInit ({ pluginConfig, pluginState, appState, mapState, mapProvider, services }) {
  const { dispatch } = pluginState
  const { events, eventBus } = services

  const isMapStyleReady = !!mapProvider.map?.getStyle()

  // Keep a ref to the latest pluginState so event handlers can access current data
  const pluginStateRef = useRef(pluginState)
  pluginStateRef.current = pluginState

  // Track initialisation and store cleanup function
  const dataSetsInstanceRef = useRef(null)

  useEffect(() => {
    const inModeWhitelist = pluginConfig.includeModes?.includes(appState.mode) ?? true
    const inExcludeModes = pluginConfig.excludeModes?.includes(appState.mode) ?? false

    if (!isMapStyleReady || !inModeWhitelist || inExcludeModes) {
      return
    }

    // Only initialise once
    if (dataSetsInstanceRef.current) {
      return
    }

    // Only initialise state if not already set
    if (!pluginState.dataSets) {
      dispatch({ type: 'SET_DATA_SETS', payload: pluginConfig.dataSets })
    }

    dataSetsInstanceRef.current = createDataSets({
      mapStyleId: mapState.mapStyle.id,
      pluginConfig,
      pluginStateRef,
      mapProvider,
      events,
      eventBus
    })
  }, [isMapStyleReady, appState.mode])

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      if (dataSetsInstanceRef.current) {
        dataSetsInstanceRef.current.remove()
        dataSetsInstanceRef.current = null
      }
    }
  }, [])

  return null
}
