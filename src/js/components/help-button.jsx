import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'

export default function HelpButton ({ helpBtnRef }) {
  const { options, dispatch, mode, activePanel, isMobile } = useApp()
  const { id } = options
  const isQueryMode = ['frame', 'vertex'].includes(mode)

  if (!isQueryMode) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'HELP' })
  }

  const button = () => {
    return (
      <button onClick={handleClick} className='fm-c-btn fm-c-btn--help govuk-body-s' ref={helpBtnRef} aria-expanded={false} {...isMobile ? { 'aria-labelledby': `${id}-help-label` } : {}} {...activePanel === 'HELP' ? { style: { display: 'none' } } : {}}>
        <svg width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
          <circle cx='10' cy='10' r='8.5' fill='none' stroke='currentColor' strokeWidth='1.5' />
          <path d='M10.935 11.673H8.708v-.223c0-1.997 2.445-2.651 2.085-3.597-.175-.46-1.57-.837-1.757.843l-2.273-.281c.407-4.359 7.331-3.069 6.405.161-.025.09-.143.502-.625.986-1.252 1.258-1.608 1.111-1.608 2.111zm-2.303.592h2.385v2.104H8.632z' fill='currentColor' stroke='none' />
        </svg>
        {!isMobile && 'Help'}
      </button>
    )
  }

  return (
    <>
      {isMobile
        ? (
          <Tooltip id={`${id}-help-label`} position='right' cssModifier='help' text='Help'>
            {button()}
          </Tooltip>
          )
        : (
            button()
          )}
    </>
  )
}
