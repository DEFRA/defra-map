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

const isVisible = (interfaceType, isTargetCentre, drawMode, features, targetCoord, activePanel) => {
  let isTargetVisible = isTargetCentre && drawMode === 'default' && !!features ? features?.resultType === 'pixel' : !!targetCoord
  // Hide when touch detected and a panel is displayed at the bottom
  if (interfaceType === 'touch') {
    isTargetVisible = isTargetVisible && (!activePanel || activePanel === 'INFO')
  }
  return isTargetVisible
}

export default function Target () {
  const { provider, drawMode, targetMarker, activePanel, viewportRef, obscurePanelRef, isContainerReady, interfaceType, isMobile } = useApp()
  const appDispatch = useApp().dispatch
  const { dispatch, features } = useViewport()
  const [isObscurred] = usePixelObscurred()

  const isTargetCentre = isCentre(interfaceType, targetMarker, activePanel)
  const hasTargetData = hasData(isTargetCentre, features, targetMarker)
  const targetCoord = !isTargetCentre ? targetMarker?.coord : null
  const isTargetVisible = isVisible(interfaceType, isTargetCentre, drawMode, features, targetCoord, activePanel)

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
        <div className={`fm-c-marker fm-c-marker--target fm-c-marker--visible fm-c-marker--center${hasTargetData ? ' fm-c-marker--has-data' : ''}`} aria-label='Map marker'>
          <div className='fm-c-marker__inner'>
            <svg width='38' height='38' viewBox='0 0 38 38' fillRule='evenodd' fill='currentColor'>
              <path d='M5.035 20H1v-2h4.035C5.525 11.069 11.069 5.525 18 5.035V1h2v4.035c6.931.49 12.475 6.034 12.965 12.965H37v2h-4.035c-.49 6.931-6.034 12.475-12.965 12.965V37h-2v-4.035C11.069 32.475 5.525 26.931 5.035 20zM19 7A12.01 12.01 0 0 0 7 19a12.01 12.01 0 0 0 12 12 12.01 12.01 0 0 0 12-12A12.01 12.01 0 0 0 19 7zm0 10a2 2 0 1 1 0 4 2 2 0 1 1 0-4z' />
              <path d='M5.035 20H1v-2h4.035a14.02 14.02 0 0 1 .246-1.8l1.96.399C7.083 17.375 7 18.178 7 19s.083 1.625.241 2.401l-1.96.399a14.02 14.02 0 0 1-.246-1.8zM20 5.035a14.02 14.02 0 0 1 1.8.246l-.399 1.96C20.625 7.083 19.822 7 19 7s-1.625.083-2.401.241l-.399-1.96a14.02 14.02 0 0 1 1.8-.246V1h2v4.035zm-2 27.93a14.02 14.02 0 0 1-1.8-.246l.399-1.96c.776.158 1.579.241 2.401.241s1.625-.083 2.401-.241l.399 1.96a14.02 14.02 0 0 1-1.8.246V37h-2v-4.035zM32.965 20a14.02 14.02 0 0 1-.246 1.8l-1.96-.399c.158-.776.241-1.579.241-2.401s-.083-1.625-.241-2.401l1.96-.399a14.02 14.02 0 0 1 .246 1.8H37v2h-4.035zM19 17a2 2 0 1 1 0 4 2 2 0 1 1 0-4zm3.8-9.385l.634-1.897a13.98 13.98 0 0 1 4.848 2.805l-1.327 1.496c-1.196-1.06-2.605-1.886-4.155-2.404zm5.181 3.43l1.496-1.327a13.98 13.98 0 0 1 2.805 4.848l-1.897.634c-.518-1.55-1.344-2.959-2.404-4.155zM30.385 22.8l1.897.634a13.98 13.98 0 0 1-2.805 4.848l-1.496-1.327c1.06-1.196 1.886-2.605 2.404-4.155zm-3.43 5.181l1.327 1.496a13.98 13.98 0 0 1-4.848 2.805l-.634-1.897c1.55-.518 2.959-1.344 4.155-2.404zM15.2 30.385l-.634 1.897a13.98 13.98 0 0 1-4.848-2.805l1.327-1.496c1.196 1.06 2.605 1.886 4.155 2.404zm-5.181-3.43l-1.496 1.327a13.98 13.98 0 0 1-2.805-4.848l1.897-.634c.518 1.55 1.344 2.959 2.404 4.155zM7.615 15.2l-1.897-.634a13.98 13.98 0 0 1 2.805-4.848l1.496 1.327c-1.06 1.196-1.886 2.605-2.404 4.155zm3.43-5.181L9.718 8.523a13.98 13.98 0 0 1 4.848-2.805l.634 1.897c-1.55.518-2.959 1.344-4.155 2.404z' />
            </svg>
          </div>
        </div>
      )}
    </>
  )
}
