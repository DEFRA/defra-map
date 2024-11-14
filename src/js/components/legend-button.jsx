import React from 'react'
import { useApp } from '../store/use-app'

export default function LegendButton ({ legendBtnRef }) {
  const { dispatch, legend, activePanel } = useApp()

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'LEGEND' })
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--legend govuk-body-s' ref={legendBtnRef} aria-expanded={false} {...activePanel === 'LEGEND' ? { style: { display: 'none' } } : {}}>
      <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
        <path d='M10 1l10 7-10 7L0 8l10-7zm0 2.441L3.488 8 10 12.559 16.512 8 10 3.441zm8.256 7.338L20 12l-10 7-10-7 1.744-1.221L10 16.559l8.256-5.78z' />
      </svg>
      <span className='fm-c-btn__label'>{legend.title || 'Layers'}</span>
    </button>
  )
}
