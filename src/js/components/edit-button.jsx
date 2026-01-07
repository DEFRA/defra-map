import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'

export default function EditButton ({ editBtnRef }) {
  const { options, legend, dispatch, mode, activePanel, previousPanel, isDesktop } = useApp()
  const { id } = options
  const isQueryMode = ['frame', 'vertex'].includes(mode)
  const hasButton = !['compact', 'inset'].includes(legend?.display) && !isDesktop && isQueryMode
  const isVisible = !(activePanel === 'INSPECTOR' || (activePanel === 'STYLE' && previousPanel === 'INSPECTOR'))

  if (!hasButton) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'INSPECTOR' })
  }

  return (
    <Tooltip id={`${id}-edit-label`} position='left' cssModifier='edit' text='View dimensions'>
      <button onClick={handleClick} className='fm-c-btn fm-c-btn--edit govuk-body-s' ref={editBtnRef} aria-expanded={false} aria-labelledby={`${id}-edit-label`} {...!isVisible ? { style: { display: 'none' } } : {}}>
        <svg width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
          <path d='M5.914 14.5l.828-.829 1.415 1.415-3.243 3.242-3.243-3.242 1.415-1.415.707.707.121.122V3.914H14.5l-.829-.828 1.415-1.415 3.242 3.243-3.242 3.243-1.415-1.415.707-.707.122-.121H5.914V14.5zm7 1.405v2.018h-2v-2.018h2zm-3 0v2.018h-2v-2.018h2zm8-1.991v4.009h-4v-2.018h2v-1.991h2zm0-2.958v2.018h-2v-2.018h2zm0-3.042v2.018h-2V7.914h2z' fill='currentColor' stroke='none' />
        </svg>
      </button>
    </Tooltip>
  )
}