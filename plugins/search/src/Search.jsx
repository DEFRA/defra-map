// src/plugins/search/Search.jsx
import { useRef, useEffect } from 'react'
import { OpenButton } from './components/OpenButton/OpenButton'
import { Form } from './components/Form/Form'
import { CloseButton } from './components/CloseButton/CloseButton'
import { createDatasets } from './datasets.js'
import { attachEvents } from './events/index.js'

export function Search({ appConfig, iconRegistry, pluginState, pluginConfig, appState, mapState, services, mapProvider }) {
  const { id } = appConfig
  const { interfaceType, breakpoint } = appState
  const { customDatasets, osNamesURL, transformRequest } = pluginConfig
  const { dispatch, isExpanded } = pluginState

  const CloseIcon = iconRegistry['close']
  const SearchIcon = iconRegistry['search']
  const searchContainerRef = useRef(null)
  const buttonRef = useRef(null)
  const inputRef = useRef(null)

  // Build datasets array from default plus custom
  const mergedDatasets = createDatasets({
    customDatasets,
    osNamesURL
  })

  // This ensures factory `attachEvents` only runs once
  const eventsRef = useRef(null)
  if (!eventsRef.current) {
    eventsRef.current = attachEvents({
      dispatch,
      datasets: mergedDatasets,
      transformRequest,
      services,
      mapProvider,
      viewportRef: appState.layoutRefs.viewportRef,
      locationMarkers: mapState.locationMarkers,
      showMarker: pluginConfig.showMarker
    })
  }
  const events = eventsRef.current

  // Manage focus outside the search control
  useEffect(() => {
    appState.dispatch({ type: 'TOGGLE_HAS_EXCLUSIVE_CONTROL', payload: isExpanded })
    if (!isExpanded) {
      return
    }

    inputRef.current?.focus()

    const handleOutside = (e) => events.handleOutside(e, searchContainerRef, appState)
    const handleTouchStart = (e) => events.handleTouchStart(e, inputRef)

    document.addEventListener('pointerdown', handleOutside)
    document.addEventListener('touchstart', handleTouchStart)

    // Add focusin only for keyboard interaction and on mobile devices
    if (interfaceType === 'keyboard' && breakpoint === 'mobile' ) {
      document.addEventListener('focusin', handleOutside)
    }

    return () => {
      document.removeEventListener('pointerdown', handleOutside)
      document.removeEventListener('touchstart', handleTouchStart)
      if (interfaceType === 'keyboard') {
        document.removeEventListener('focusin', handleOutside)
      }
    }
  }, [isExpanded, interfaceType])

  return (
    <div className="dm-c-search" ref={searchContainerRef}>
      <OpenButton
        id={id}
        isExpanded={isExpanded}
        onClick={() => events.handleOpenClick(appState)}
        buttonRef={buttonRef}
        SearchIcon={SearchIcon}
      />
      <Form
        id={id}
        pluginState={pluginState}
        pluginConfig={pluginConfig}
        appState={appState}
        inputRef={inputRef}
        events={events}
      >
        <CloseButton onClick={(e) => events.handleCloseClick(e, buttonRef, appState)} CloseIcon={CloseIcon} />
      </Form>
    </div>
  )
}