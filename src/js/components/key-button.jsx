import React from 'react'
import { useApp } from '../store/use-app'

export default function KeyButton ({ keyBtnRef }) {
  const { dispatch, activePanel, options, drawMode } = useApp()
  const isQueryMode = ['frame', 'vertex'].includes(drawMode)
  const hasBtn = options?.legend?.display === 'inset'

  if (!(options?.legend && !isQueryMode && !hasBtn)) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'KEY' })
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--key' ref={keyBtnRef} aria-expanded={false} {...['KEY', 'SEARCH'].includes(activePanel) ? { style: { display: 'none' } } : {}}>
      <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
        <path d='M9.125 5V3h9v2h-9zm0 6V9h9v2h-9zm0 6v-2h9v2h-9zm-3-9v4h-4V8h4zm0-6v4h-4V2h4zm0 12v4h-4v-4h4z' />
      </svg>
      <span className='fm-c-btn__label'>Key</span>
    </button>
  )
}
