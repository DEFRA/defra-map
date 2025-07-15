import React, { useEffect, useState } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import Tooltip from './tooltip.jsx'

export default function Reset () {
  const { options } = useApp()
  const { id } = options
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
    <Tooltip id={`${id}-reset-label`} cssModifier='reset' position='left' text='Reset map view'>
      <button onClick={handleOnClick} className='fm-c-btn fm-c-btn--reset' aria-labelledby={`${id}-reset-label`} aria-controls={`${id}-viewport`} aria-disabled={!isNewArea}>
        <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
          <path d='M1.554 7.371L4.75.907l4 6.928-7.196-.464z' fill='currentColor'/>
          <path d='M6.75 4.371A6.46 6.46 0 0 1 10 3.5c3.587 0 6.5 2.913 6.5 6.5s-2.913 6.5-6.5 6.5-6.5-2.913-6.5-6.5' fill='none' stroke='currentColor' strokeWidth='2'/>
        </svg>
      </button>
    </Tooltip>
  )
}
