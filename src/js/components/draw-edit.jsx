import React from 'react'
import { useApp } from '../store/use-app'

export default function DrawEdit () {
  const { provider, mode, dispatch } = useApp()

  const handleEditClick = () => {
    provider.draw.edit()
    dispatch({ type: 'SET_MODE', payload: { value: 'draw' } })
  }

  const handleBoxClick = () => {
    provider.draw.reset()
    dispatch({ type: 'SET_MODE', payload: { value: 'frame' } })
  }

  // const handleDoneClick = () => {
  //     const feature = provider.draw.finishEdit()
  //     dispatch({ type: 'SET_MODE', value: 'draw' })
  // }

  // const handleResetClick = () => {
  //     provider.draw.reset()
  // }

  return (
    <div className='fm-o-viewport-controls'>
      <button onClick={handleEditClick} className='fm-c-btn fm-c-btn--edit govuk-body-s' {...mode === 'draw' ? { style: { display: 'none' } } : {}}>
        <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='none' stroke='currentColor' strokeWidth='2'>
          <path d='M16 6v7.996M14 16H6m-2-2.004V6m2-2h8' /><circle cx='4' cy='4' r='2' /><circle cx='4' cy='15.996' r='2' /><circle cx='16' cy='4' r='2' /><circle cx='16' cy='15.996' r='2' />
        </svg>
        Edit shape
      </button>
      <button onClick={handleBoxClick} className='fm-c-btn fm-c-btn--edit govuk-body-s' {...mode === 'frame' ? { style: { display: 'none' } } : {}}>
        <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='none' stroke='currentColor' strokeWidth='2'>
          <rect x='2' y='2' width='16' height='16' />
        </svg>
        Use box
      </button>
    </div>
  )
}
