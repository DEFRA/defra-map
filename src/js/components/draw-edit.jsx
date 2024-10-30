import React from 'react'
import { useApp } from '../store/use-app'

export default function DrawEdit () {
  const { provider, mode, dispatch } = useApp()

  if (!mode) return

  const handleEditClick = () => {
    provider.draw.edit()
    dispatch({ type: 'SET_MODE', value: 'draw', isFrameVisible: false })
  }

  const handleBoxClick = () => {
    provider.draw.reset()
    dispatch({ type: 'SET_MODE', value: 'frame', isFrameVisible: true })
  }

  // const handleDoneClick = () => {
  //     const feature = provider.draw.finishEdit()
  //     dispatch({ type: 'SET_MODE', value: 'draw', isFrameVisible: !feature })
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
      {/* <Tooltip id={`${id}-finish-edit-label`} position='below' text='Finish editing'>
                <button onClick={handleDoneClick} aria-labelledby={`${id}-finish-edit-label`} className='fm-c-btn fm-c-btn--done govuk-body-s' { ...!isDrawMode ? { style: { display: 'none' }} : {} }>
                    <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' strokeLinecap='square' stroke='currentColor' strokeWidth='0.5'>
                        <path d='M1.5,11l5.496,5.5l11.504,-11.5l-1.5,-1.5l-10,10l-4,-4l-1.5,1.5Z' fill='currentColor' />
                    </svg>
                </button>
            </Tooltip>
            <Tooltip id={`${id}-delete-point-label`} position='below' text='Delete point'>
                <button aria-labelledby={`${id}-delete-point-label`} className='fm-c-btn fm-c-btn--delete govuk-body-s' { ...!isDrawMode ? { style: { display: 'none' }} : {} }>
                    <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' strokeLinecap='square' stroke='currentColor' strokeWidth='2'>
                        <path d='M7,7l6,6'/><path d='M13,7l-6,6'/><circle cx='10' cy='10' r='7.5' fill='none' />
                    </svg>
                </button>
            </Tooltip>
            <Tooltip id={`${id}-edit-reset-label`} position='below' text='Reset to square'>
                <button onClick={handleResetClick} aria-labelledby={`${id}-edit-reset-label`} className='fm-c-btn fm-c-btn--reset govuk-body-s' { ...!isDrawMode ? { style: { display: 'none' }} : {} }>
                    <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
                        <path d='M2.054 7.871L5.25 1.407l4 6.928-7.196-.464z' fill='currentColor'/><path d='M7.25 4.871A6.46 6.46 0 0 1 10.5 4c3.587 0 6.5 2.913 6.5 6.5S14.087 17 10.5 17 4 14.087 4 10.5' fill='none' stroke='currentColor' strokeWidth='2'/>
                    </svg>
                </button>
            </Tooltip> */}
    </div>
  )
}
