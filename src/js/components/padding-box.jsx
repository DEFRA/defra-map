import React, { useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

const getClassName = (isFocusArea, isActive, drawShape) => {
  const visible = isFocusArea ? ' fm-c-padding-box--visible' : ''
  const active = isActive ? ' fm-c-padding-box--active' : ''
  const shape = drawShape ? ` fm-c-padding-box--${drawShape}` : ''
  return `fm-c-padding-box${visible}${active}${shape}`
}

export default function PaddingBox ({ isFocusArea, children }) {
  const { provider, isContainerReady, drawMode, shape, viewportRef, obscurePanelRef, targetMarker, frameRef, isMobile } = useApp()
  const { dispatch, features, padding, isAnimate, isDrawValid } = useViewport()

  // Template properties
  const isActive = (isFocusArea && features?.featuresInFocus?.length) || (drawMode === 'frame' && isDrawValid)
  const drawShape = drawMode === 'frame' ? shape : null
  const className = getClassName(isFocusArea, isActive, drawShape)

  // Update provider padding (uses current padding box), need to run this before viewport action effect
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
