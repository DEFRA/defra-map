import React from 'react'
import { useApp } from '../store/use-app.js'

export default function PixelQueryButton () {
  const { viewportRef } = useApp()

  const handleOnClick = () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    viewportRef.current.dispatchEvent(event)
  }

  return (
    <button onClick={handleOnClick} className='fm-c-btn fm-c-btn--primary govuk-body-s'>
      Get feature information
    </button>
  )
}
