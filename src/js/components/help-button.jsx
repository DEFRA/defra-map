import React from 'react'
import { useApp } from '../store/use-app'

export default function HelpButton ({ helpBtnRef }) {
  const { dispatch, mode, isDesktop, activePanel } = useApp()
  const isQueryMode = ['frame', 'draw'].includes(mode)
  
  if (!isQueryMode || isDesktop) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'HELP' })
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--help govuk-body-s' ref={helpBtnRef} aria-expanded={false} {...activePanel === 'HELP' ? { style: { display: 'none' } } : {}}>
      <svg width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
        <circle cx='10' cy='10' r='8.5' fill='none' stroke='currentColor' strokeWidth='1.5' />
        <path d='M10.935 11.673H8.708v-.223c0-1.997 2.445-2.651 2.085-3.597-.175-.46-1.57-.837-1.757.843l-2.273-.281c.407-4.359 7.331-3.069 6.405.161-.025.09-.143.502-.625.986-1.252 1.258-1.608 1.111-1.608 2.111zm-2.303.592h2.385v2.104H8.632z' fill='currentColor' stroke='none' />
      </svg>
      Help
    </button>
  )
}
