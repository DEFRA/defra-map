import React, { useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

export default function PaddingBox ({ children }) {
  const { provider, isContainerReady, mode, viewportRef, paddingBoxRef, obscurePanelRef, targetMarker, frameRef, isFrameVisible, isKeyboard, isMobile } = useApp()
  const { dispatch, features, padding, isAnimate } = useViewport()

  // Update provider padding, need to run this before viewport action effect
  useEffect(() => {
    if (!provider.map) return
    provider.setPadding(targetMarker?.coord, isAnimate)
  }, [padding])

  // Set initial viewport padding before provider map is initialised
  useEffect(() => {
    if (!isContainerReady) return
    dispatch({ type: 'SET_PADDING', panel: obscurePanelRef?.current, viewport: viewportRef.current, isMobile })
  }, [isContainerReady])

  // Update padding if isMobile change, needs timeout
  useEffect(() => {
    setTimeout(() => {
      dispatch({ type: 'SET_PADDING', panel: obscurePanelRef.current, viewport: viewportRef.current, isMobile, isAnimate: false })
    }, 0)
  }, [isMobile])

  // Reset padding on entering draw mode
  useEffect(() => {
    if (!['frame', 'draw'].includes(mode)) return
    dispatch({ type: 'SET_PADDING', viewport: viewportRef.current, isMobile, isAnimate: false })
  }, [mode])

  // Template properties
  const isVisible = isKeyboard && features?.isFeaturesInMap
  const isActive = isKeyboard && features?.featuresInViewport.length

  return (
    <div className={`fm-c-padding-box${isFrameVisible ? ' fm-c-padding-box--frame-mode' : ''}${isVisible ? ' fm-c-padding-box--visible' : ''}${isActive ? ' fm-c-padding-box--active' : ''}`} {...padding ? { style: padding } : {}} ref={paddingBoxRef}>
      <div className='fm-c-padding-box__frame' ref={frameRef} />
      {children}
    </div>
  )
}
