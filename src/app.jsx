import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { settings, events } from './js/store/constants.js'
import eventBus from './js/lib/eventbus.js'
import { AppProvider } from './js/store/app-provider.jsx'
import Container from './js/components/container.jsx'
import Provider from './js/provider/os-maplibre/provider.js'

export default function App (options) {
  const mobileMQ = `(max-width: ${options.maxMobile || settings.breakpoints.MAX_MOBILE})`
  const desktopMQ = `(min-width: ${options.minDesktop || settings.breakpoints.MIN_DESKTOP})`
  const colorSchemeMQ = '(prefers-color-scheme: dark)'
  const { type, parent, target, handleExit } = options

  const [isMobile, setIsMobile] = useState(window?.matchMedia(mobileMQ).matches)
  const [isDarkMode, setIsDarkMode] = useState(window?.matchMedia(colorSchemeMQ).matches)
  const [isDesktop, setIsDesktop] = useState(window.matchMedia(desktopMQ).matches)
  const [isKeyboard, setIsKeyboard] = useState(!!options.isKeyboard)

  // Create a provider instance
  const provider = useRef(new Provider(options.provider))
  const viewportRef = useRef(null)
  const paddingBoxRef = useRef(null)
  const frameRef = useRef(null)
  const obscurePanelRef = useRef(null)
  const activeRef = useRef(null)

  //
  // Event handlers
  //

  const handleMobileMQ = e => setIsMobile(e.matches)
  const handleDesktopMQ = e => setIsDesktop(e.matches)
  const handleColorSchemeMQ = e => setIsDarkMode(e.matches)

  //
  // Side effects
  //

  useEffect(() => {
    // Avoid flicker on refresh
    document.body.classList.remove('fm-js-hidden')

    // Set media queries
    window.matchMedia(mobileMQ).addEventListener('change', handleMobileMQ)
    window.matchMedia(desktopMQ).addEventListener('change', handleDesktopMQ)
    window.matchMedia(colorSchemeMQ).addEventListener('change', handleColorSchemeMQ)

    // Keyboard events
    eventBus.on(parent, events.SET_IS_KEYBOARD, data => setIsKeyboard(data))

    return () => {
      window.removeEventListener('change', handleMobileMQ)
      window.removeEventListener('change', handleDesktopMQ)
    }
  }, [])

  const isPage = (type === 'buttonFirst') || (type === 'hybrid' && isMobile)

  return (
    <AppProvider
      options={options}
      app={{
        provider: provider.current,
        isPage,
        isMobile,
        isDarkMode,
        isDesktop,
        isBack: window.history.state?.isBack,
        isKeyboard,
        parent,
        handleExit,
        viewportRef,
        paddingBoxRef,
        frameRef,
        obscurePanelRef,
        activeRef
      }}
    >
      {target ? createPortal(<Container />, parent) : <Container />}
    </AppProvider>
  )
}
