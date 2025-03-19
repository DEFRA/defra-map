import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'
import ActionMenu from './action-menu.jsx'

export default function DrawEdit () {
  const { provider, options, mode, shape, drawModes, dispatch } = useApp()
  const { id } = options
  const isQueryMode = ['frame', 'vertex'].includes(mode)
  // const hasDrawCapability = provider.capabilities?.hasDraw
  const changeShapeDisplay = 'block'
  const selectedDrawMode = drawModes.find(m => m.id === shape) || drawModes[0]

  if (!isQueryMode) {
    return null
  }

  const handleShapeSelect = (id) => {
    const value = drawModes.find(m => m.id === id).mode
    provider.draw.edit(value, id)
    dispatch({ type: 'SET_MODE', payload: { value, shape: id } })
  }

  const handleDeleteVertexClick = () => {
    console.log('handleDeleteVertexClick')
  }

  return (
    <div className='fm-o-viewport-controls'>
      <ActionMenu id={id} name='Change shape' display={changeShapeDisplay} items={drawModes} selected={selectedDrawMode} handleSelect={handleShapeSelect} width='164px' />
      <Tooltip id={`${id}-delete-vertex-label`} position='below' cssModifier='delete-vertex' text='Delete point' display='none'>
        <button onClick={handleDeleteVertexClick} className='fm-c-btn fm-c-btn--edit' aria-labelledby={`${id}-delete-vertex-label`} aria-disabled='true'>
          <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
            <path d='M15.985 6v7.048M12.993 16h-6.98M4.02 13.996V6m1.994-2h7.977' stroke='currentColor' strokeWidth='2' />
            <path d='M2 2h3.988v4H2zm0 12h3.988v4H2zM14.016 2h3.988v4h-3.988z' fill='currentColor' />
            <g fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M12.521 12.548l6.98 7' />
              <path d='M12.521 19.548l6.98-7' />
            </g>
          </svg>
        </button>
      </Tooltip>
    </div>
  )
}
