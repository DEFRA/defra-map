// src/core/store/ServiceProvider.jsx
import React, { createContext, useMemo, useRef } from 'react'
import eventBus from '../../services/eventBus.js'
import { createAnnouncer } from '../../services/announcer.js'
import { reverseGeocode } from '../../services/reverseGeocode.js'
import { useConfig } from '../store/configContext.js'
import { closeApp } from '../../services/closeApp.js'

export const ServiceContext = createContext(null)

export const ServiceProvider = ({ children }) => {
  const { handleExitClick } = useConfig()
  const mapStatusRef = useRef(null)
  const announce = useMemo(() => createAnnouncer(mapStatusRef), [])

  const services = useMemo(() => ({
    announce,
    reverseGeocode: (zoom, center) => reverseGeocode(zoom, center),
    eventBus,
    mapStatusRef,
    closeApp: () => closeApp(handleExitClick)
  }), [announce])

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  )
}
