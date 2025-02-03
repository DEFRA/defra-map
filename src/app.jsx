import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { settings, events } from './js/store/constants.js'
import eventBus from './js/lib/eventbus.js'
import { AppProvider } from './js/store/app-provider.jsx'
import Container from './js/components/container.jsx'
import Provider from './js/provider/os-maplibre/provider.js'

export default function App (options) {
  const { behaviour, parent, container, handleExit, styles, requestCallback, geocodeProvider, symbols } = options
  const mobileMQ = `(max-width: ${options.maxMobile || settings.breakpoints.MAX_MOBILE})`
  const desktopMQ = `(min-width: ${options.minDesktop || settings.breakpoints.MIN_DESKTOP})`

  const [isMobile, setIsMobile] = useState(window?.matchMedia(mobileMQ).matches)
  const [isDesktop, setIsDesktop] = useState(window.matchMedia(desktopMQ).matches)
  const [interfaceType, setInterfaceType] = useState(!!options.interfaceType)

  // Create a provider instance
  const provider = useRef(new Provider({
    requestCallback,
    geocodeProvider,
    symbols,
    ...styles
  }))
  const viewportRef = useRef(null)
  const frameRef = useRef(null)
  const obscurePanelRef = useRef(null)
  const activeRef = useRef(null)

  //
  // Event handlers
  //

  const handleMobileMQ = e => setIsMobile(e.matches)
  const handleDesktopMQ = e => setIsDesktop(e.matches)

  //
  // Side effects
  //

  useEffect(() => {
    // Avoid flicker on refresh
    document.body.classList.remove('fm-js-hidden')

    // Set media queries
    window.matchMedia(mobileMQ).addEventListener('change', handleMobileMQ)
    window.matchMedia(desktopMQ).addEventListener('change', handleDesktopMQ)

    // Keyboard and touch events
    eventBus.on(parent, events.SET_INTERFACE_TYPE, data => setInterfaceType(data))

    return () => {
      window.removeEventListener('change', handleMobileMQ)
      window.removeEventListener('change', handleDesktopMQ)
    }
  }, [])

  const isPage = (behaviour === 'buttonFirst') || (behaviour === 'hybrid' && isMobile)

  return (
    <AppProvider
      options={options}
      app={{
        provider: provider.current,
        isPage,
        isMobile,
        isDesktop,
        isBack: window.history.state?.isBack,
        interfaceType,
        parent,
        handleExit,
        viewportRef,
        frameRef,
        obscurePanelRef,
        activeRef
      }}
    >
      {container ? createPortal(<Container />, parent) : <Container />}
    </AppProvider>
  )
}
