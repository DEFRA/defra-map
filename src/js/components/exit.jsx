import React from 'react'
import { useApp } from '../store/use-app'

export default function Exit () {
  const { options, isBack, handleExit, isDesktop } = useApp()

  const isFixed = options.legend.display !== 'inset' && isDesktop

  return (
    <button onClick={handleExit} className='fm-c-btn fm-c-btn--exit govuk-body-s'>
      <svg aria-hidden='true' focusable='false' width={isBack ? '14' : '20'} height='20' viewBox={isBack ? '0 0 14 20' : '0 0 20 20'}>
        {isBack
          ? isFixed
            ? <path d='M10.193,17.777l-7.778,-7.777l7.778,-7.778l1.414,1.414l-6.364,6.364l6.364,6.363l-1.414,1.414Z' fill='currentColor' strokeWidth='0' />
            : <path d='M3.828 10l8.486 8.485-1.415 1.414L1 10 10.899.101l1.415 1.414L3.828 10z' fill='currentColor' strokeWidth='0' />
          : <path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' fill='currentColor' strokeWidth='0' />}
      </svg>
      <span className='fm-c-btn__label'>{isBack ? 'Back' : 'Exit'}</span>
    </button>
  )
}
