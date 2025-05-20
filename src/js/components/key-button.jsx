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
        <path d='M9 5V3h9v2H9zm0 6V9h9v2H9zm0 6v-2h9v2H9zm-5-3a2.01 2.01 0 0 1 2 2 2.01 2.01 0 0 1-2 2 2.01 2.01 0 0 1-2-2 2.01 2.01 0 0 1 2-2zm2-6v4H2V8h4zM4 2l2.25 4h-4.5L4 2z' />
      </svg>
      <span className='fm-c-btn__label'>Key</span>
    </button>
  )
}
