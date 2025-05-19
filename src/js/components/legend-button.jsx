import React from 'react'
import { useApp } from '../store/use-app'
import { defaults } from '../store/constants'

export default function LegendButton ({ legendBtnRef }) {
  const { dispatch, mode, legend, isDesktop, activePanel } = useApp()
  const isQueryMode = ['frame', 'vertex'].includes(mode)
  const hasBtn = legend?.display && ['compact', 'inset'].includes(legend.display)
  const legendTitle = legend?.title || defaults.LEGEND_TITLE

  if (!(legend && !isQueryMode && !(isDesktop && !hasBtn))) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'LEGEND' })
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--legend' ref={legendBtnRef} aria-expanded={false} {...['LEGEND', 'SEARCH'].includes(activePanel) ? { style: { display: 'none' } } : {}}>
      <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
        {legendTitle.toLowerCase() === 'layers'
          ? (
            <path d='M10 1l10 7-10 7L0 8l10-7zm0 2.441L3.488 8 10 12.559 16.512 8 10 3.441zm8.256 7.338L20 12l-10 7-10-7 1.744-1.221L10 16.559l8.256-5.78z' />
            )
          : (
            <path d='M2 5V3h16v2H2zm0 6V9h16v2H2zm0 6v-2h16v2H2z' />
            )}
      </svg>
      <span className='fm-c-btn__label'>{legendTitle || 'Layers'}</span>
    </button>
  )
}
