import React, { useEffect, useRef, useMemo } from 'react'
import { useQueryState } from '../hooks/use-query-state.js'
import { useResizeObserver } from '../hooks/use-resize-observer.js'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { settings, offsets, events } from '../store/constants.js'
import { debounce } from '../lib/debounce.js'
import { getSelectedStatus, getShortcutKey, getSelectedIndex, getMapPixel } from '../lib/viewport.js'
import eventBus from '../lib/eventbus.js'
import PaddingBox from './padding-box.jsx'
import Target from './target.jsx'

const getClassName = (size, isDarkBasemap, isFocusVisible) => {
  return `fm-o-viewport${size !== 'small' ? ' fm-o-viewport--' + size : ''}${isDarkBasemap ? ' fm-o-viewport--dark-basemap' : ''}${isFocusVisible ? ' fm-u-focus-visible' : ''}`
}

export default function Viewport () {
  const { isContainerReady, provider, options, parent, mode, segments, layers, viewportRef, frameRef, activePanel, activeRef, featureId, targetMarker, isMobile, interfaceType } = useApp()
  const { id, styles, queryFeature, queryPixel, queryPolygon } = options
  const appDispatch = useApp().dispatch

  const { bbox, centre, zoom, oCentre, oZoom, rZoom, minZoom, maxZoom, maxExtent, features, basemap, size, status, isStatusVisuallyHidden, action, timestamp, isMoving, isUpdate } = useViewport()
  const viewportDispatch = useViewport().dispatch

  const [, setQueryCz] = useQueryState(settings.params.centreZoom)

  const mapContainerRef = useRef(null)
  const featureIdRef = useRef(-1)
  const startPixel = useRef([0, 0])
  const labelPixel = useRef(null)
  const isDraggingRef = useRef(false)

  const STATUS_DELAY = 300

  const selectQuery = () => {
    if (!(queryFeature || queryPixel)) {
      return
    }
    if (featureIdRef.current >= 0 && features.featuresInViewport?.length) {
      const fId = features.featuresInViewport[featureIdRef.current].id
      provider.queryFeature(fId)
      return
    }
    if (!isMoving) {
      const scale = size === 'large' ? 2 : 1
      const point = getMapPixel(frameRef.current, scale)
      provider.queryPoint(point)
    }
  }

  const cycleFeatures = e => {
    if (!features.featuresInViewport?.length) {
      return
    }
    const { featuresInViewport } = features
    const selectedIndex = getSelectedIndex(e.key, featuresInViewport.length, featureIdRef.current)
    featureIdRef.current = selectedIndex < featuresInViewport.length ? selectedIndex : 0
    const statusText = getSelectedStatus(featuresInViewport, selectedIndex)
    const fId = featuresInViewport[selectedIndex]?.id || featuresInViewport[0]?.id
    appDispatch({ type: 'SET_SELECTED', payload: { featureId: fId, activePanel: null } })
    // Debounce status update
    debounceUpdateStatus(statusText)
  }

  const panMap = e => {
    e.preventDefault()
    const offset = offsets[e.shiftKey ? 'shiftPan' : 'pan'][e.key.toUpperCase()]
    provider.panBy(offset)
  }

  const handleKeyDown = e => {
    // Pan map (Cursor keys)
    if (!e.altKey && offsets.pan[e.key.toUpperCase()]) {
      panMap(e)
    }

    // Zoom map (+ or -)
    if (['+', '-', '=', '_'].includes(e.key)) {
      ['+', '='].includes(e.key) ? provider.zoomIn() : provider.zoomOut()
    }

    // Select feature or query centre (Enter or Space)
    if (['Enter', 'Space'].includes(e.key) && mode === 'default') {
      selectQuery()
    }

    // Cycle through feature list (PageUp and PageDown)
    if (['PageDown', 'PageUp'].includes(e.key) && queryFeature) {
      e.preventDefault()
      cycleFeatures(e)
    }

    // Disable body scroll
    if (e.altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && provider.showNextLabel) {
      e.preventDefault()
    }
  }

  const handleKeyUp = e => {
    // Get map details (Alt + i)
    if (provider.getNearest && e.altKey && e.code.slice(-1) === 'I') {
      viewportDispatch({ type: 'CLEAR_STATUS' })
      // Debounce place update
      debounceUpdatePlace(centre)
    }

    // Open keyboard controls (Alt + k)
    if (e.altKey && e.code.slice(-1) === 'K') {
      appDispatch({ type: 'OPEN', payload: 'KEYBOARD' })
    }

    // Feature shortcut keys (Alt + 1 - 9)
    if (e.altKey && /^[1-9]$/.test(e.code.slice(-1))) {
      const fId = getShortcutKey(e, features?.featuresInViewport)
      provider.queryFeature(fId)
    }

    // Clear selected feature and label
    if (['Escape', 'Esc'].includes(e.key)) {
      e.preventDefault()
      // Triggers an update event
      labelPixel.current = provider?.hideLabel()
      appDispatch({ type: 'SET_SELECTED', payload: { featureId: null } })
    }

    // Select label (Alt + arrow key)
    if (e.altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && provider.showNextLabel) {
      const direction = e.key.substring(5).toLowerCase()
      // Triggers an update event
      labelPixel.current = provider.showNextLabel(labelPixel.current, direction)
    }
  }

  const handleClick = e => {
    if (!isDraggingRef.current) {
      const { layerX, layerY } = e.nativeEvent
      const scale = size === 'large' ? 2 : 1
      const point = [layerX / scale, layerY / scale]
      if (e.altKey) {
        labelPixel.current = provider.showLabel(point)
      } else if (!(mode !== 'default' || !(queryFeature || queryPixel))) {
        provider.queryPoint(point)
      } else {
        // No action
      }
    }
  }

  const handleMapLoad = e => {
    // Add polygonFeature
    if (queryPolygon?.feature) {
      provider.initDraw(queryPolygon)
    }
    eventBus.dispatch(parent, events.APP_READY, {
      ...e.detail, mode, segments, layers, basemap, size
    })
  }

  const handleMovestart = e => {
    const isUserInitiated = e.detail.isUserInitiated
    viewportDispatch({ type: 'MOVE_START', payload: isUserInitiated })
    if (isKeyboard && activePanel === 'INFO' && isUserInitiated) {
      appDispatch({ type: 'CLOSE' })
    }
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

  // Get new bbox after map moveend
  const handleUpdate = e => {
    viewportDispatch({ type: 'UPDATE', payload: e.detail })
  }

  // Provider map click
  const handleMapQuery = e => {
    const { resultType } = e.detail
    const { items, isPixelFeaturesAtPixel, coord } = e.detail.features
    const selectedId = resultType === 'feature' && items.length ? items[0].id : null
    const marker = resultType === 'pixel' ? { coord, hasData: isPixelFeaturesAtPixel } : null
    appDispatch({ type: 'SET_SELECTED', payload: { featureId: selectedId, targetMarker: marker, activePanelHasFocus: true } })
    eventBus.dispatch(parent, events.APP_QUERY, { ...e.detail, basemap, size, segments, layers })
  }

  // Provider style change
  const handleMapStyle = e => {
    eventBus.dispatch(parent, events.APP_CHANGE, { ...e.detail, size, mode, segments, layers })
  }

  // Update place
  const debounceUpdatePlace = debounce(async (coord) => {
    const place = await provider.getNearest(coord)
    viewportDispatch({ type: 'UPDATE_PLACE', payload: place })
  }, STATUS_DELAY)

  // Update status
  const debounceUpdateStatus = debounce(text => {
    viewportDispatch({ type: 'UPDATE_STATUS', payload: { status: text, isStatusVisuallyHidden: true } })
  }, STATUS_DELAY)

  // Template properties
  const isKeyboard = interfaceType === 'keyboard'
  const isFocusVisible = isKeyboard && document.activeElement === viewportRef.current
  const isDarkBasemap = ['dark', 'aerial'].includes(basemap)
  const className = getClassName(size, isDarkBasemap, isFocusVisible)

  // Initial render
  useEffect(() => {
    if (isContainerReady && !provider.isLoaded) {
      provider.init({
        target: mapContainerRef.current,
        paddingBox: frameRef.current,
        bbox,
        centre,
        zoom,
        minZoom,
        maxZoom,
        maxExtent,
        basemap,
        size,
        featureLayers: queryFeature,
        pixelLayers: queryPixel
      })

      provider.addEventListener('load', handleMapLoad)
      provider.addEventListener('update', handleUpdate)
      provider.addEventListener('mapquery', handleMapQuery)
    }

    // We need to know if open was triggered by the button
    if (document.querySelector('[data-fm-open]')) {
      activeRef.current = viewportRef.current
    }

    return () => {
      provider.removeEventListener('load', handleMapLoad)
      provider.removeEventListener('update', handleUpdate)
      provider.removeEventListener('mapquery', handleMapQuery)
      provider?.remove()
    }
  }, [isContainerReady])

  // Add movestart event listner each time activePanel changes
  useEffect(() => {
    provider.addEventListener('movestart', handleMovestart)

    return () => {
      provider.removeEventListener('movestart', handleMovestart)
    }
  }, [isKeyboard, activePanel, action])

  // Handle viewport action
  useEffect(() => {
    provider.addEventListener('style', handleMapStyle)

    switch (action) {
      case 'SEARCH':
        bbox ? provider.fitBbox(bbox) : provider.setCentre(centre, zoom)
        break
      case 'RESET':
        provider.setCentre(oCentre, rZoom)
        break
      case 'GEOLOC':
        provider.setCentre(centre, oZoom)
        provider.showLocation(centre)
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
      case 'BASEMAP':
        window.localStorage.setItem('basemap', basemap)
        provider.setBasemap(basemap)
        break
      default:
        // No action
    }

    return () => {
      provider.removeEventListener('style', handleMapStyle)
    }
  }, [timestamp, action, mode, basemap, size])

  // All query params, debounced by provider. Must be min 300ms
  useEffect(() => {
    if (isUpdate) {
      setQueryCz(`${centre.toString()},${zoom}`)
    }
  }, [isUpdate])

  // Swap basemap on light/dark mode change
  useEffect(() => {
    if (!provider.map) {
      return
    }
    const colourScheme = window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    viewportDispatch({ type: 'SET_BASEMAP', payload: { basemap, colourScheme } })
  }, [window?.matchMedia('(prefers-color-scheme: dark)').matches])

  // Set initial selected feature
  useEffect(() => {
    provider.selectFeature(featureId)
  }, [featureId, targetMarker])

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
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...(featureId ? { 'aria-activedescendant': `${id}-feature-${featureId}` } : {})}
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
          <div className={`fm-c-status${isStatusVisuallyHidden || !status ? ' fm-u-visually-hidden' : ''}`} aria-live='assertive'>
            <div className='fm-c-status__inner govuk-body-s' aria-atomic>
              {status}
            </div>
          </div>
        )
      }, [status])}
      {!isMobile && (
        <div className='fm-o-attribution'>
          <div className='fm-c-attribution'>{styles.attribution}</div>
        </div>
      )}
    </div>
  )
}
