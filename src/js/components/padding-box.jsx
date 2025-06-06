import React, { useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

const getClassName = (isVisible, isActive, drawShape) => {
  const visible = isVisible ? ' fm-c-padding-box--visible' : ''
  const active = isActive ? ' fm-c-padding-box--active' : ''
  const shape = drawShape ? ` fm-c-padding-box--${drawShape}` : ''
  return `fm-c-padding-box${visible}${active}${shape}`
}

export default function PaddingBox ({ children }) {
  const { provider, isContainerReady, drawMode, shape, viewportRef, obscurePanelRef, targetMarker, frameRef, interfaceType, isMobile } = useApp()
  const { dispatch, features, padding, isAnimate, isDrawValid } = useViewport()

  // Template properties
  const isVisible = (interfaceType === 'keyboard' && features?.isFeaturesInMap) || drawMode === 'frame'
  const isActive = interfaceType === 'keyboard' && (features?.featuresInViewport.length) || (drawMode === 'frame' && isDrawValid)
  const drawShape = drawMode === 'frame' ? shape : null
  const className = getClassName(isVisible, isActive, drawShape)

  // Update provider padding, need to run this before viewport action effect
  useEffect(() => {
    if (provider.map) {
      provider.setPadding(targetMarker?.coord, isAnimate)
    }
  }, [padding])

  // Set initial viewport padding before provider map is initialised
  useEffect(() => {
    if (isContainerReady) {
      dispatch({ type: 'SET_PADDING', payload: { panel: obscurePanelRef?.current, viewport: viewportRef.current, isMobile } })
    }
  }, [isContainerReady])

  // Update padding if isMobile change, needs timeout
  useEffect(() => {
    setTimeout(() => {
      dispatch({ type: 'SET_PADDING', payload: { panel: obscurePanelRef.current, viewport: viewportRef.current, isMobile, isAnimate: false } })
    }, 0)
  }, [isMobile])

  // Reset padding on entering vertex drawMode
  useEffect(() => {
    if (['frame', 'vertex'].includes(drawMode)) {
      dispatch({ type: 'SET_PADDING', payload: { viewport: viewportRef.current, isMobile, isAnimate: false } })
    }
  }, [drawMode])

  return (
    <div className={className} {...padding ? { style: padding } : {}}>
      <div className='fm-c-padding-box__frame' ref={frameRef} />
      {children}
    </div>
  )
}
