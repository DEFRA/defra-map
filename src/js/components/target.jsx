import React, { useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { usePixelObscurred } from '../hooks/use-pixel-obscurred'

export default function Target () {
  const { provider, mode, targetMarker, activePanel, viewportRef, obscurePanelRef, isContainerReady, isKeyboard, isMobile } = useApp()
  const { dispatch, features } = useViewport()
  const [isObscurred] = usePixelObscurred()

  const isTargetCentre = isKeyboard && !(targetMarker && activePanel === 'INFO')
  const hasTargetData = isTargetCentre ? features?.isPixelFeaturesAtPixel : targetMarker?.hasData
  const targetCoord = !isTargetCentre ? targetMarker?.coord : null
  const isTargetVisible = isTargetCentre && mode === 'default' && !!features ? features?.resultType === 'pixel' : !!targetCoord

  // Conditionally show target marker
  useEffect(() => {
    provider.setTargetMarker(targetCoord, hasTargetData, isTargetVisible)
  }, [provider.map, targetCoord, hasTargetData, isTargetVisible])

  // Update padding if target marker is obscurred
  useEffect(() => {
    if (!isObscurred || !(isContainerReady && obscurePanelRef.current)) return
    dispatch({ type: 'SET_PADDING', panel: obscurePanelRef.current, viewport: viewportRef.current, isMobile, isAnimate: true })
  }, [isObscurred])

  return (
    !targetCoord && isTargetVisible
      ? (
        <div className={`fm-c-marker fm-c-marker--target fm-c-marker--visible fm-c-marker--centre${hasTargetData ? ' fm-c-marker--has-data' : ''}`} aria-label='Map marker'>
          <div class='fm-c-marker__inner'>
            <svg width='69' height='69' viewBox='0 0 69 69' fillRule='evenodd' fill='none' stroke='currentColor'>
              <circle cx='34.5' cy='34.5' r='33' strokeWidth='2' />
              <path d='M1.5 34.5H31m3.5-33V31m0 36.5V38m33-3.5H38' />
            </svg>
          </div>
        </div>
        )
      : null
  )
}
