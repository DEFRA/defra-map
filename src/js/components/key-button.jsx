import React from 'react'
import { useApp } from '../store/use-app'
import { labels } from '../store/constants'

export default function KeyButton ({ keyBtnRef }) {
  const { dispatch, activePanel, options, drawMode } = useApp()
  const isQueryMode = ['frame', 'vertex'].includes(drawMode)
  const isCombined = ['compact', 'inset'].includes(options?.legend?.display)
  const label = labels.legend.TITLE
  const svg = labels.legend.SVG

  if (!(options?.legend && !isQueryMode && !isCombined)) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'KEY' })
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--key' ref={keyBtnRef} aria-expanded={false} {...['KEY', 'SEARCH'].includes(activePanel) ? { style: { display: 'none' } } : {}}>
      <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' dangerouslySetInnerHTML={{__html: svg}}/>
      <span className='fm-c-btn__label'>{label}</span>
    </button>
  )
}
