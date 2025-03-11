import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'

export default function DrawEdit () {
  const { provider, options, mode, dispatch } = useApp()
  const { id } = options
  const isQueryMode = ['frame', 'draw'].includes(mode)
  const hasDrawCapability = provider.capabilities?.hasDraw
  
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
        <span>Edit shape</span>
      </button>
      {hasDrawCapability ? (
        <div className='fm-o-viewport-controls__group' {...mode === 'frame' ? { style: { display: 'none' } } : {}}>
          <Tooltip id={`${id}-frame-label`} position='below' cssModifier='frame' text='Use frame'>
            <button onClick={handleSquareClick} className='fm-c-btn fm-c-btn--edit' aria-labelledby={`${id}-frame-label`}>
              <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20'>
                <path d='M16 6v7.996M14 16H6m-2-2.004V6m2-2h8' fill='none' stroke='currentColor' strokeWidth='2' />
                <path d='M2.081 2H6v4H2.081zm0 12H6v4H2.081zm11.96-12h3.919v4h-3.919zm0 11.996h3.919v4h-3.919z' fill='currentColor' stroke='none' />
              </svg>
            </button>
          </Tooltip>
          <Tooltip id={`${id}-format-label`} position='below' cssModifier='format' text='Format item'>
            <button onClick={handleSquareClick} className='fm-c-btn fm-c-btn--edit' aria-labelledby={`${id}-format-label`}>
              <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
                <path d='M6.146 10.269l-.995-.995c-.193-.192-.193-.505 0-.698l1.224-1.224 6.343 6.343-1.224 1.224c-.193.193-.506.193-.698 0l-1.115-1.114c-.39-.39-1.102-.353-1.414 0L4.76 18.019c-.702.628-2.048.781-2.828 0s-.629-2.126 0-2.828c.756-.846 3.695-3.048 4.214-3.507.353-.313.39-1.024 0-1.415zm-3.507 7.043a1 1 0 0 0 1.414-1.414 1 1 0 0 0-1.414 1.414zM7.415 6.271l4.819-4.82 1.071 1.071-.333 1.081 1.04-.374 1.839 1.839-1.186 2.741 2.529-1.398 1.404 1.404-4.82 4.82-6.363-6.364z' stroke='currentColor' strokeWidth='.5'/>
              </svg>
            </button>
          </Tooltip>
        </div>
      ) : (
        <button onClick={handleSquareClick} className='fm-c-btn fm-c-btn--edit' {...mode === 'frame' ? { style: { display: 'none' } } : {}}>
          <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20'>
            <path d='M16 6v7.996M14 16H6m-2-2.004V6m2-2h8' fill='none' stroke='currentColor' strokeWidth='2' />
            <path d='M2.081 2H6v4H2.081zm0 12H6v4H2.081zm11.96-12h3.919v4h-3.919zm0 11.996h3.919v4h-3.919z' fill='currentColor' stroke='none' />
          </svg>
          <span>Use square</span>
        </button>
      )}
    </div>
  )
}
