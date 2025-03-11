import React from 'react'
import { useApp } from '../store/use-app'

export default function DrawEdit () {
  const { provider, mode, dispatch } = useApp()
  const isQueryMode = ['frame', 'draw'].includes(mode)

  console.log(provider)
  
  if (!isQueryMode) {
    return null
  }

  const handleShapeClick = () => {
    provider.draw.edit()
    dispatch({ type: 'SET_MODE', payload: { value: 'draw' } })
  }

  const handleSquareClick = () => {
    provider.draw.reset()
    dispatch({ type: 'SET_MODE', payload: { value: 'frame' } })
  }

  return (
    <div className='fm-o-viewport-controls'>
      <button onClick={handleShapeClick} className='fm-c-btn fm-c-btn--edit' {...mode === 'draw' ? { style: { display: 'none' } } : {}}>
        <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='none' stroke='currentColor' strokeWidth='2'>
          <path d='M16 6v7.996M14 16H6m-2-2.004V6m2-2h8' />
          <circle cx='4' cy='4' r='2' />
          <circle cx='4' cy='15.996' r='2' />
          <circle cx='16' cy='4' r='2' />
          <circle cx='16' cy='15.996' r='2' />
        </svg>
        Edit shape
      </button>
      <button onClick={handleSquareClick} className='fm-c-btn fm-c-btn--edit' {...mode === 'frame' ? { style: { display: 'none' } } : {}}>
        <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20'>
          <path d='M16 6v7.996M14 16H6m-2-2.004V6m2-2h8' fill='none' stroke='currentColor' strokeWidth='2' />
          <path d='M2.081 2H6v4H2.081zm0 12H6v4H2.081zm11.96-12h3.919v4h-3.919zm0 11.996h3.919v4h-3.919z' fill='currentColor' stroke='none' />
        </svg>
        Use square
      </button>
    </div>
  )
}
