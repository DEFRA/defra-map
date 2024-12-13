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
    <button onClick={handleOnClick} className={`fm-c-btn fm-c-btn--primary`} {...(!isVisible && { 'style': { display: 'none' } })}>
      Get feature information
    </button>
  )
}
