import React from 'react'
import { useApp } from '../store/use-app'
import { defaults } from '../store/constants'

export default function LegendButton ({ legendBtnRef }) {
  const { dispatch, drawMode, legend, isDesktop, activePanel } = useApp()
  const isQueryMode = ['frame', 'vertex'].includes(drawMode)
  const hasBtn = legend?.display && ['compact', 'inset'].includes(legend?.display)
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
        {legendTitle.toLowerCase() === 'menu'
          ? (
            <path d='M10 .75c5.105 0 9.25 4.145 9.25 9.25s-4.145 9.25-9.25 9.25S.75 15.105.75 10 4.895.75 10 .75zm0 1.5c-4.277 0-7.75 3.473-7.75 7.75s3.473 7.75 7.75 7.75 7.75-3.473 7.75-7.75S14.277 2.25 10 2.25zm3.356 5.565L14.77 9.23 10 14 5.23 9.23l1.414-1.415L10 11.172l3.356-3.357z'/>
            )
          : (
            <path d='M10 1l10 7-10 7L0 8l10-7zm0 2.441L3.488 8 10 12.559 16.512 8 10 3.441zm8.256 7.338L20 12l-10 7-10-7 1.744-1.221L10 16.559l8.256-5.78z' />
            )}
      </svg>
      <span className='fm-c-btn__label'>{legendTitle}</span>
    </button>
  )
}
