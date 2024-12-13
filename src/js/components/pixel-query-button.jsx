import React from 'react'
import { useApp } from '../store/use-app.js'

export default function PixelQueryButton () {
  const { viewportRef, interfaceType, isTargetVisible, activePanel } = useApp()

  const handleOnClick = () => {
    const event = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    viewportRef.current.dispatchEvent(event)
  }

  const isVisible = interfaceType === 'touch' && isTargetVisible && !activePanel
  
  return (
    <div className='fm-o-actions' {...(!isVisible && { 'style': { display: 'none' } })}>
      <button onClick={handleOnClick} className='fm-c-btn fm-c-btn--primary govuk-body-s'>
        Get feature information
      </button>
    </div>
  )
}
