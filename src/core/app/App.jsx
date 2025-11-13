import React, { useEffect } from 'react'
import { AppProvider } from '../store/AppProvider.jsx'
import { MapProvider } from '../store/MapProvider.jsx'
import { ServiceProvider } from '../store/ServiceProvider.jsx'
import { removeLoadingState } from '../../api/domStateManager.js'
import { PluginProvider } from '../store/PluginProvider.jsx'
import { PluginInits } from '../renderer/PluginInits.jsx'
import { Layout } from '../layout/Layout.jsx'
import eventBus from '../../services/eventBus.js'

export const App = (props) => {
  useEffect(() => {
    removeLoadingState()
    eventBus.emit('app:ready')
  }, [])

  return (
    <AppProvider options={props}>
      <MapProvider options={props}>
        <ServiceProvider>
          <PluginProvider>
            <PluginInits />
            <Layout />
          </PluginProvider>
        </ServiceProvider>
      </MapProvider>
    </AppProvider>
  )
}
