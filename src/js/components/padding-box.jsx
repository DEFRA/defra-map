import React, { useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

const getClassName = (isVisible, isActive, drawMode, shape) => {
  const frame = drawMode === 'frame' ? ` fm-c-padding-box--${shape}` : ''
  return `fm-c-padding-box${frame}${isVisible ? ' fm-c-padding-box--visible' : ''}${isActive ? ' fm-c-padding-box--active' : ''}`
}

export default function PaddingBox ({ children }) {
  const { provider, options, isContainerReady, drawMode, shape, viewportRef, obscurePanelRef, targetMarker, frameRef, interfaceType, isMobile } = useApp()
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

  // Reset padding on entering vertex drawMode
  useEffect(() => {
    if (['frame', 'vertex'].includes(drawMode)) {
      dispatch({ type: 'SET_PADDING', payload: { viewport: viewportRef.current, isMobile, isAnimate: false } })
    }
  }, [drawMode])

  // Template properties
  const isVisible = interfaceType === 'keyboard' && (options.queryLocation?.layers || options.queryFeature?.layers)
  const isActive = interfaceType === 'keyboard' && (features?.featuresInViewport.length || features?.isPixelFeaturesInMap)
  const className = getClassName(isVisible, isActive, drawMode, shape)

  return (
    <div className={className} {...padding ? { style: padding } : {}}>
      <div className='fm-c-padding-box__frame' ref={frameRef} />
      {children}
    </div>
  )
}
