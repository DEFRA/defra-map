import React, { useEffect, useState } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'

export default function Reset () {
  const { options } = useApp()
  const { bounds, oCentre, rZoom, center, zoom } = useViewport()
  const viewportDispatch = useViewport().dispatch
  const [isNewArea, setIsNewArea] = useState(false)

  const handleOnClick = () => {
    if (!isNewArea) {
      return
    }
    viewportDispatch({ type: 'RESET' })
  }

  useEffect(() => {
    const isSameCentre = JSON.stringify(oCentre) === JSON.stringify(center)
    const isSameZoom = rZoom === zoom
    const isNew = oCentre && center && rZoom && zoom && !(isSameCentre && isSameZoom)
    setIsNewArea(isNew)
  }, [bounds])

  if (!options?.hasReset) {
    return null
  }

  return (
    <button onClick={handleOnClick} className='fm-c-btn fm-c-btn--reset govuk-body-s' aria-label='Reset map area' aria-disabled={!isNewArea} aria-controls={`${options.id}-viewport`}>
      <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
        <path d='M2.054 7.871L5.25 1.407l4 6.928-7.196-.464z' />
        <path d='M7.25 4.871A6.46 6.46 0 0 1 10.5 4c3.587 0 6.5 2.913 6.5 6.5S14.087 17 10.5 17 4 14.087 4 10.5' fill='none' stroke='currentColor' strokeWidth='2' />
      </svg>
    </button>
  )
}
