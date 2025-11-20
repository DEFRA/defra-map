// src/core/components/Viewport/MapStatus.jsx
import React from 'react'
import { useService } from '../../store/serviceContext'

export const MapStatus = () => {
  const { mapStatusRef } = useService()

  return (
    <div
      ref={mapStatusRef}
      role='status'
      className='dm-c-viewport__status'
      aria-live='polite'
      aria-atomic='true'
      // aria-relevant="additions"
      aria-label='Map updates'
    />
  )
}
