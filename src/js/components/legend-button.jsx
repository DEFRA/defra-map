import React from 'react'
import { useApp } from '../store/use-app'
import { defaults } from '../store/constants'

export default function LegendButton ({ legendBtnRef }) {
  const { dispatch, drawMode, legend, isDesktop, activePanel } = useApp()
  const isQueryMode = ['frame', 'vertex'].includes(drawMode)
  const hasBtn = legend?.display && ['compact', 'inset'].includes(legend.display)
  const legendTitle = legend?.title || defaults.LEGEND_TITLE
  const width = legendTitle === 'layers' ? 20 : 16

  if (!(legend && !isQueryMode && !(isDesktop && !hasBtn))) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'LEGEND' })
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--legend' ref={legendBtnRef} aria-expanded={false} {...['LEGEND', 'SEARCH'].includes(activePanel) ? { style: { display: 'none' } } : {}}>
      <svg aria-hidden='true' focusable='false' width={width} height='20' viewBox={`0 0 ${width} 20`} fillRule='evenodd' fill='currentColor'>
        {legendTitle.toLowerCase() === 'layers'
          ? (
            <path d='M10 1l10 7-10 7L0 8l10-7zm0 2.441L3.488 8 10 12.559 16.512 8 10 3.441zm8.256 7.338L20 12l-10 7-10-7 1.744-1.221L10 16.559l8.256-5.78z' />
            )
          : (
            <path d='M13.356 6.586L14.77 8 8 14.77 1.23 8l1.414-1.414L8 11.942l5.356-5.356z' />
            // <path d='M3 5V3h14v2H3zm0 6V9h14v2H3zm0 6v-2h14v2H3z'/>
            )}
      </svg>
      <span className='fm-c-btn__label'>{legendTitle || 'Layers'}</span>
    </button>
  )
}
