import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'

export default function StylesButton ({ stylesBtnRef }) {
  const { provider, dispatch, options } = useApp()
  const { id } = options
  const { basemaps } = provider

  // Mousedown used as target can move between mouseDown and mouseUp
  const handlePointerDown = e => {
    if (e.button !== 0) {
      return
    }
    dispatch({ type: 'OPEN', payload: 'STYLE' })
  }

  // Keydown used as target can move between keyDown and keyUp
  const handleKeyDown = e => {
    if (!['Enter', 'Space'].includes(e.key)) {
      return
    }
    dispatch({ type: 'OPEN', payload: 'STYLE' })
  }

  return (
    <>
      {basemaps?.length > 1
        ? (
          <Tooltip id={`${id}-style-label`} position='left' cssModifier='style' text='Choose map style'>
            <button onPointerDown={handlePointerDown} onKeyDown={handleKeyDown} className='fm-c-btn fm-c-btn--style govuk-body-s' aria-labelledby={`${id}-style-label`} ref={stylesBtnRef}>
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' strokeLinejoin='round' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M2 18l5-2 6 2 5-2V2l-5 2-6-2-5 2v14z' /><path d='M7 2v14m6-12v14' strokeLinecap='round' />
              </svg>
            </button>
          </Tooltip>
          )
        : null}
    </>
  )
}
