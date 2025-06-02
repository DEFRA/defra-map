import React from 'react'
import { useApp } from '../store/use-app'
import { labels } from '../store/constants'

export default function LegendButton ({ legendBtnRef }) {
  const { dispatch, drawMode, legend, draw, isDesktop, activePanel } = useApp()
  const isQueryMode = ['frame', 'vertex'].includes(drawMode)
  const isCombined = ['compact', 'inset'].includes(legend?.display)
  const combinedLabel = isCombined && labels.legend.TITLE
  const seperateLabel = draw?.heading ? labels.menu.TITLE : labels.layers.TITLE
  const label = combinedLabel || seperateLabel
  const path = (labels[label.toLowerCase()] || labels.legend).PATH
  const hasButton = legend && !isQueryMode && !(isDesktop && !isCombined)

  if (!hasButton) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'LEGEND' })
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--legend' ref={legendBtnRef} aria-expanded={false} {...['LEGEND', 'SEARCH'].includes(activePanel) ? { style: { display: 'none' } } : {}}>
      <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
        <path d={path} />
      </svg>
      <span className='fm-c-btn__label'>{label}</span>
    </button>
  )
}
