import React from 'react'
import { useApp } from '../store/use-app'

export default function KeyButton ({ keyBtnRef }) {
  const { dispatch, activePanel, options, mode } = useApp()
  const isQueryMode = ['frame', 'vertex'].includes(mode)

  if (!(options?.legend && !isQueryMode && !options?.legend?.display)) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'KEY' })
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--key' ref={keyBtnRef} aria-expanded={false} {...activePanel === 'KEY' ? { style: { display: 'none' } } : {}}>
      <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
        <circle cx='3.5' cy='4' r='1.5' />
        <circle cx='3.5' cy='10' r='1.5' />
        <circle cx='3.5' cy='16' r='1.5' />
        <path d='M7 4h11M7 10h11M7 16h11' fill='none' stroke='currentColor' strokeWidth='2' />
      </svg>
      <span className='fm-c-btn__label'>Key</span>
    </button>
  )
}
