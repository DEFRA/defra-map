import React from 'react'
import { useApp } from '../store/use-app'

export default function KeyButton ({ keyBtnRef }) {
  const { isEditMode, isMobile, dispatch, legend, activePanel } = useApp()

  if (!legend) return

  const handleClick = () => {
    dispatch({ type: 'OPEN', data: 'KEY' })
  }

  return (
    <button onClick={handleClick} aria-label='Key' className='fm-c-btn fm-c-btn--key govuk-body-s' ref={keyBtnRef} aria-expanded={false} {...activePanel === 'KEY' ? { style: { display: 'none' } } : {}}>
      <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
        <circle cx='3.5' cy='4' r='1.5' /><circle cx='3.5' cy='10' r='1.5' /><circle cx='3.5' cy='16' r='1.5' /><path d='M7 4h11M7 10h11M7 16h11' fill='none' stroke='currentColor' strokeWidth='2' />
      </svg>
      <span className='fm-c-btn__label' aria-hidden {...isMobile && isEditMode ? { style: { display: 'none' } } : {}}>
        Key
      </span>
    </button>
  )
}
