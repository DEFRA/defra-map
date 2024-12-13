import React, { useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { usePixelObscurred } from '../hooks/use-pixel-obscurred.js'

const isCentre = (interfaceType, targetMarker, activePanel) => {
  return ['keyboard', 'touch'].includes(interfaceType) && !(targetMarker && activePanel === 'INFO')
}

const hasData = (isTargetCentre, features, targetMarker) => {
  return isTargetCentre ? features?.isPixelFeaturesAtPixel : targetMarker?.hasData
}

const isVisible = (interfaceType, isTargetCentre, mode, features, targetCoord, activePanel) => {
  let isTargetVisible = isTargetCentre && mode === 'default' && !!features ? features?.resultType === 'pixel' : !!targetCoord
  // Hide when touch detected and a panel is displayed at the bottom
  if (interfaceType === 'touch') {
    isTargetVisible = isTargetVisible && (!activePanel || activePanel === 'INFO')
  }
  return isTargetVisible
}

export default function Target () {
  const { provider, mode, targetMarker, activePanel, viewportRef, obscurePanelRef, isContainerReady, interfaceType, isMobile } = useApp()
  const appDispatch = useApp().dispatch
  const { dispatch, features } = useViewport()
  const [isObscurred] = usePixelObscurred()

  const isTargetCentre = isCentre(interfaceType, targetMarker, activePanel)
  const hasTargetData = hasData(isTargetCentre, features, targetMarker)
  const targetCoord = !isTargetCentre ? targetMarker?.coord : null
  const isTargetVisible = isVisible(interfaceType, isTargetCentre, mode, features, targetCoord, activePanel)

  // Update app state
  useEffect(() => {
    appDispatch({ type: 'SET_IS_TARGET_VISIBLE', payload: isTargetVisible })
  }, [isTargetVisible])

  // Conditionally show target marker
  useEffect(() => {
    provider.setTargetMarker(targetCoord, hasTargetData, isTargetVisible)
  }, [provider.map, targetCoord, hasTargetData, isTargetVisible])

  // Update padding if target marker is obscurred
  useEffect(() => {
    if (!isObscurred || !(isContainerReady && obscurePanelRef.current)) {
      return
    }
    dispatch({ type: 'SET_PADDING', payload: { panel: obscurePanelRef.current, viewport: viewportRef.current, isMobile, isAnimate: true } })
  }, [isObscurred])

  return (
    <>
      {!targetCoord && isTargetVisible && (
        <div className={`fm-c-marker fm-c-marker--target fm-c-marker--visible fm-c-marker--centre${hasTargetData ? ' fm-c-marker--has-data' : ''}`} aria-label='Map marker'>
          <div className='fm-c-marker__inner'>
            <svg width='69' height='69' viewBox='0 0 69 69' fillRule='evenodd' fill='none' stroke='currentColor'>
              <circle cx='34.5' cy='34.5' r='33' strokeWidth='2' />
              <path d='M1.5 34.5H31m3.5-33V31m0 36.5V38m33-3.5H38' />
            </svg>
          </div>
        </div>
      )}
    </>
  )
}
