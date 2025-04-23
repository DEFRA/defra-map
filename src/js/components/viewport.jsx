import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import { useQueryState } from '../hooks/use-query-state.js'
import { useResizeObserver } from '../hooks/use-resize-observer.js'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { settings, offsets, events } from '../store/constants.js'
import { debounce } from '../lib/debounce.js'
import { getShortcutKey, getMapPixel, getScale, getPoint } from '../lib/viewport.js'
import { getColor } from '../lib/utils.js'
import eventBus from '../lib/eventbus.js'
import PaddingBox from './padding-box.jsx'
import Target from './target.jsx'
import { toggleInert } from '../lib/dom.js'

const getClassName = (size, isDarkBasemap, isFocusVisible, isKeyboard, hasShortcuts) => {
  return `fm-o-viewport${size !== 'small' ? ' fm-o-viewport--' + size : ''}${isDarkBasemap ? ' fm-o-viewport--dark-style' : ''}${hasShortcuts && isKeyboard ? ' fm-o-viewport--has-shortcuts' : ''}${isFocusVisible ? ' fm-u-focus-visible' : ''}`
}

export default function Viewport () {
  const { isContainerReady, provider, options, parent, mode, shape, segments, layers, viewportRef, frameRef, activePanel, activeRef, featureId, targetMarker, interfaceType } = useApp()
  const { id, hasAutoMode, backgroundColor, queryFeature, queryLocation, queryArea } = options
  const appDispatch = useApp().dispatch

  const { style, bounds, center, zoom, oCentre, originalZoom, rZoom, minZoom, maxZoom, features, size, status, isStatusVisuallyHidden, hasShortcuts, action, timestamp, isMoving, isUpdate } = useViewport()
  const viewportDispatch = useViewport().dispatch
  const [, setQueryCz] = useQueryState(settings.params.centerZoom)

  const mapContainerRef = useRef(null)
  const startPixel = useRef([0, 0])
  const labelPixel = useRef(null)
  const pointerPixel = useRef(null)
  const isDraggingRef = useRef(false)
  const STATUS_DELAY = 500

  // Template properties
  const isKeyboard = interfaceType === 'keyboard'
  const isFocusVisible = isKeyboard && document.activeElement === viewportRef.current
  const isDarkBasemap = ['dark', 'aerial'].includes(style?.name)
  const className = getClassName(size, isDarkBasemap, isFocusVisible, isKeyboard, hasShortcuts)
  const scale = getScale(size)
  const bgColor = getColor(backgroundColor, style?.name)

  const handleFocus = () => {
    toggleInert(viewportRef.current)
  }

  const handleKeyDown = e => {
    // Disable body scroll
    if (e.key !== 'Tab') {
      e.preventDefault()
    }

    // Pan map (Cursor keys)
    if (!e.altKey && offsets.pan[e.key.toUpperCase()]) {
      provider.panBy(offsets[e.shiftKey ? 'shiftPan' : 'pan'][e.key.toUpperCase()])
    }

    // Zoom map (+ or -)
    if (['+', '-', '=', '_'].includes(e.key)) {
      // ['+', '='].includes(e.key) ? provider.zoomIn() : provider.zoomOut()
      ['+', '='].includes(e.key) ? viewportDispatch({ type: 'ZOOM_IN' }) : viewportDispatch({ type: 'ZOOM_OUT' })
    }

    // Select feature or query center (Enter)
    if (!e.altKey && e.key === 'Enter' && mode === 'default') {
      if (featureId) {
        provider.queryFeature(featureId)
      } else if (queryLocation?.layers && !isMoving) {
        const point = getMapPixel(frameRef.current, scale)
        provider.queryPoint(point)
      } else {
        // No action
      }
    }

    // Cycle through feature list (PageUp and PageDown)
    if (['PageDown', 'PageUp'].includes(e.key) && queryFeature) {
      labelPixel.current = provider?.hideLabel()
      viewportDispatch({ type: 'TOGGLE_SHORTCUTS', payload: true })
      appDispatch({ type: 'SET_NEXT_SELECTED', payload: { key: e.key, features: features.featuresInViewport } })
      activeRef.current = viewportRef.current
    }
  }

  const handleKeyUp = e => {
    // Get map details (Alt + i)
    if (e.altKey && e.code.slice(-1) === 'I') {
      viewportDispatch({ type: 'CLEAR_STATUS' })
      // Debounce place update
      debounceUpdatePlace(center)
    }

    // Open keyboard controls (Alt + k)
    if (e.altKey && e.code.slice(-1) === 'K') {
      appDispatch({ type: 'OPEN', payload: 'KEYBOARD' })
    }

    // Clear selected feature and label
    if (['Escape', 'Esc'].includes(e.key)) {
      // Triggers an update event
      labelPixel.current = provider.hideLabel ? provider.hideLabel() : null
      viewportDispatch({ type: 'CLEAR' })
      appDispatch({ type: 'SET_SELECTED', payload: { featureId: null } })
    }

    // Feature shortcut keys (Alt + 1 - 9)
    if (e.altKey && /^[1-9]$/.test(e.code.slice(-1))) {
      const fId = getShortcutKey(e, features?.featuresInViewport)
      provider.queryFeature(fId)
    }

    // Select label (Alt + arrow key)
    if (e.altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && provider.showNextLabel) {
      const direction = e.key.substring(5).toLowerCase()
      // Triggers an update event
      viewportDispatch({ type: 'TOGGLE_SHORTCUTS', payload: false })
      labelPixel.current = provider.showNextLabel(labelPixel.current, direction)
    }

    // Select label (Alt + Enter with mousehover)
    if (e.altKey && e.key === 'Enter' && pointerPixel.current && provider.showLabel) {
      viewportDispatch({ type: 'TOGGLE_SHORTCUTS', payload: false })
      labelPixel.current = provider.showLabel(pointerPixel.current)
    }
  }

  const handleClick = e => {
    // Hide panel
    if (['SEARCH', 'KEY'].includes(activePanel)) {
      appDispatch({ type: 'CLOSE' })
      return
    }

    // Query point
    if (!isDraggingRef.current) {
      const point = getPoint(viewportRef.current, e, scale)
      if (e.altKey && provider.showLabel) {
        labelPixel.current = provider.showLabel(point)
      } else if (!(mode !== 'default' || !(queryFeature?.layers || queryLocation?.layers))) {
        provider.queryPoint(point)
      } else {
        // No action
      }
    }
  }

  const handlePointerMove = e => {
    const { layerX, layerY } = e.nativeEvent
    pointerPixel.current = [layerX / scale, layerY / scale]
  }

  const handleMapLoad = e => {
    eventBus.dispatch(parent, events.APP_READY, {
      ...e.detail, mode, segments, layers, style: style.name, size
    })
  }

  const handlePointerDown = e => {
    startPixel.current = [e.pageX, e.pageY]
    isDraggingRef.current = false
  }

  const handlePointerUp = e => {
    const diffX = Math.abs(e.pageX - startPixel.current[0])
    const diffY = Math.abs(e.pageY - startPixel.current[1])
    isDraggingRef.current = diffX >= offsets.drag || diffY >= offsets.drag
  }

  // Update place after Alt + i
  const debounceUpdatePlace = useCallback(debounce(async (coord) => {
    const place = await provider.getNearest(coord)
    viewportDispatch({ type: 'UPDATE_PLACE', payload: place || 'remote area' })
  }, STATUS_DELAY), [])

  // Provider events
  const handleMoveStart = e => {
    const isUserInitiated = e.detail.isUserInitiated
    viewportDispatch({ type: 'MOVE_START', payload: isUserInitiated })
    if (isKeyboard && activePanel === 'INFO' && isUserInitiated) {
      appDispatch({ type: 'CLOSE' })
    }
  }

  // Get is min or max zoom during animation
  const handleMove = e => {
    viewportDispatch({ type: 'MOVE', payload: { ...e.detail } })
  }

  // Get new bounds after map has moved
  const debounceUpdate = useCallback(debounce(async (e) => {
    viewportDispatch({ type: 'UPDATE', payload: e.detail })
  }, STATUS_DELAY), [])

  const handleUpdate = e => {
    viewportDispatch({ type: 'CLEAR_STATUS' })
    debounceUpdate(e)
  }

  // Map query
  const handleMapQuery = e => {
    const { resultType } = e.detail
    const { items, isPixelFeaturesAtPixel, coord } = e.detail.features
    const selectedId = resultType === 'feature' && items.length ? items[0].id : null
    const marker = resultType === 'pixel' ? { coord, hasData: isPixelFeaturesAtPixel } : null
    appDispatch({ type: 'SET_SELECTED', payload: { featureId: selectedId, targetMarker: marker, activePanelHasFocus: true } })
    eventBus.dispatch(parent, events.APP_QUERY, { ...e.detail, style: style.name, size, segments, layers })
  }

  // Provider style change
  const handleMapStyle = e => {
    eventBus.dispatch(parent, events.APP_CHANGE, { ...e.detail, style: style.name, size, mode, segments, layers })
  }

  // Initial render
  useEffect(() => {
    if (isContainerReady && !provider.isLoaded) {
      provider.init({
        ...options,
        container: mapContainerRef.current,
        paddingBox: frameRef.current,
        bounds,
        center,
        zoom,
        minZoom,
        maxZoom,
        style,
        size,
        featureLayers: queryFeature?.layers,
        locationLayers: queryLocation?.layers
      })

      provider.addEventListener('load', handleMapLoad)
      provider.addEventListener('update', handleUpdate)
      provider.addEventListener('move', handleMove)
      provider.addEventListener('mapquery', handleMapQuery)
    }

    // We need to know if open was triggered by the button
    if (document.querySelector('[data-fm-open]')) {
      activeRef.current = viewportRef.current
    }

    return () => {
      provider.removeEventListener('load', handleMapLoad)
      provider.removeEventListener('update', handleUpdate)
      provider.removeEventListener('move', handleMove)
      provider.removeEventListener('mapquery', handleMapQuery)
      provider?.remove()
    }
  }, [isContainerReady])

  // Movestart and vertex edit need access to some state
  useEffect(() => {
    provider.addEventListener('movestart', handleMoveStart)

    return () => {
      provider.removeEventListener('movestart', handleMoveStart)
    }
  }, [isKeyboard, activePanel, action])

  // Handle viewport action
  useEffect(() => {
    provider.addEventListener('style', handleMapStyle)

    switch (action) {
      case 'SEARCH':
        bounds ? provider.fitBounds(bounds) : provider.setCentre(center, zoom)
        // Close search and move focus to viewport
        appDispatch({ type: 'CLOSE' })
        activeRef.current = viewportRef.current
        break
      case 'RESET':
        provider.setCentre(oCentre, rZoom)
        break
      case 'GEOLOC':
        provider.setCentre(center, originalZoom)
        provider.showLocation(center)
        break
      case 'ZOOM_IN':
        provider.zoomIn()
        break
      case 'ZOOM_OUT':
        provider.zoomOut()
        break
      case 'SIZE':
        window.localStorage.setItem('size', size)
        provider.setSize(size)
        break
      case 'STYLE':
        window.localStorage.setItem('style', style.name)
        provider.setStyle(style, minZoom, maxZoom)
        break
      default:
        // No action
    }

    return () => {
      provider.removeEventListener('style', handleMapStyle)
    }
  }, [timestamp, action, mode, style, size])

  // All query params, debounced by provider. Must be min 500ms
  useEffect(() => {
    if (isUpdate) {
      setQueryCz(`${center.toString()},${zoom}`)
    }
  }, [isUpdate])

  // Swap style on light/dark mode change
  useEffect(() => {
    if (hasAutoMode && provider.map) {
      const colourScheme = window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      viewportDispatch({ type: 'SET_STYLE', payload: { style: style.name, colourScheme } })
    }
  }, [window?.matchMedia('(prefers-color-scheme: dark)').matches])

  // Set initial selected feature
  useEffect(() => {
    provider.selectFeature(featureId)
  }, [featureId, targetMarker])

  // Initialise draw
  useEffect(() => {
    if (provider.map && !provider.draw && (mode !== 'default' || queryArea?.feature)) {
      provider.initDraw({ ...queryArea, mode, shape })
    }
  }, [provider.map, mode])

  // Update view padding on resize
  useResizeObserver(viewportRef.current, () => {
    provider.setPadding(null, false)
  })

  return (
    <div
      id={`${id}-viewport`}
      className={className}
      role='application'
      aria-labelledby={`${id}-viewport-label`}
      {...isUpdate ? { 'aria-describedby': `${id}-viewport-description` } : {}}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      {...featureId ? { 'aria-activedescendant': `${id}-feature-${featureId}` } : {}}
      {...backgroundColor ? { style: { backgroundColor: bgColor } } : {}}
      aria-owns={`${id}-viewport-features`}
      tabIndex='0'
      ref={viewportRef}
      data-fm-viewport
    >
      <div id={`${id}-map-container`} className='fm-o-map-container' ref={mapContainerRef} />
      <PaddingBox>
        <Target />
      </PaddingBox>
      <ul id={`${id}-viewport-features`} className='fm-u-visually-hidden' role='listbox' aria-labelledby={`${id}-viewport-label`}>
        {features?.featuresInViewport.map(feature => {
          const uid = `${id}${feature.id}`
          return (
            <li key={uid} id={`${id}-feature-${feature.id}`} role='option' aria-selected={featureId === (feature.id)} aria-setsize='-1' tabIndex='-1'>{feature.name}</li>
          )
        })}
      </ul>
      {useMemo(() => {
        return (
          <div className={`fm-c-status${isStatusVisuallyHidden || !status ? ' fm-u-visually-hidden' : ''}`} aria-live={isUpdate ? 'polite' : 'assertive'}>
            <div id={`${id}-viewport-description`} className='fm-c-status__inner' aria-atomic>
              {status}
            </div>
          </div>
        )
      }, [status])}
    </div>
  )
}
