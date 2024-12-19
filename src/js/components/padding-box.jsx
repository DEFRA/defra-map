import React, { useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

export default function PaddingBox ({ children }) {
  const { provider, isContainerReady, mode, viewportRef, obscurePanelRef, targetMarker, frameRef, interfaceType, isMobile } = useApp()
  const { dispatch, features, padding, isAnimate } = useViewport()

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

  // Reset padding on entering draw mode
  useEffect(() => {
    if (['frame', 'draw'].includes(mode)) {
      dispatch({ type: 'SET_PADDING', payload: { viewport: viewportRef.current, isMobile, isAnimate: false } })
    }
  }, [mode])

  // Template properties
  const isVisible = interfaceType === 'keyboard' && features?.isFeaturesInMap
  const isActive = interfaceType === 'keyboard' && features?.featuresInViewport.length
  const isFrame = mode === 'frame'

  return (
    <div className={`fm-c-padding-box${isFrame ? ' fm-c-padding-box--frame-mode' : ''}${isVisible ? ' fm-c-padding-box--visible' : ''}${isActive ? ' fm-c-padding-box--active' : ''}`} {...padding ? { style: padding } : {}}>
      <div className='fm-c-padding-box__frame' ref={frameRef} />
      {children}
    </div>
  )
}
