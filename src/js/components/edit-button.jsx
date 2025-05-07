import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'

export default function EditButton ({ editBtnRef }) {
  const { options, dispatch, mode, activePanel, previousPanel } = useApp()
  const { id } = options
  const isQueryMode = ['frame', 'vertex'].includes(mode)
  const isVisible = !(activePanel === 'EDIT' || (activePanel === 'STYLE' && previousPanel === 'EDIT'))

  if (!isQueryMode) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'EDIT' })
  }

  return (
    <Tooltip id={`${id}-edit-label`} position='right' cssModifier='edit' text='Edit dimensions' display={!isVisible ? 'none' : 'block'}>
      <button onClick={handleClick} className='fm-c-btn fm-c-btn--edit govuk-body-s' ref={editBtnRef} aria-expanded={false} aria-labelledby={`${id}-edit-label`} {...!isVisible ? { style: { display: 'none' } } : {}}>
        <svg width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
          <path d='M11.298 4.666l3.536 3.536-7.071 7.071-3.536-3.536 7.071-7.071zm2.475-2.475a1.5 1.5 0 0 1 2.121 0l1.415 1.415a1.5 1.5 0 0 1 0 2.121l-1.768 1.768-3.536-3.536 1.768-1.768zM3.52 12.444l3.536 3.536-5.304 1.768 1.768-5.304z' fill='currentColor' stroke='none' />
        </svg>
      </button>
    </Tooltip>
  )
}
