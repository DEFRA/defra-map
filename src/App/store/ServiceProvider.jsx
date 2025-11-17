// src/core/store/ServiceProvider.jsx
import React, { createContext, useMemo, useRef } from 'react'
import eventBus from '../../services/eventBus.js'
import { createAnnouncer } from '../../services/announcer.js'
import { reverseGeocode } from '../../services/reverseGeocode.js'

export const ServiceContext = createContext(null)

export const ServiceProvider = ({ children }) => {
  const mapStatusRef = useRef(null)
  const announce = useMemo(() => createAnnouncer(mapStatusRef), [])

  const services = useMemo(() => ({
    announce,
    reverseGeocode: (zoom, center) => reverseGeocode(zoom, center),
    eventBus,
    mapStatusRef
  }), [announce])

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  )
}
