import React from 'react'
import { useApp } from '../store/use-app.js'
import { tools as defaultTools } from '../store/constants.js'
import { useDrawHandlers } from '../hooks/use-draw-handlers'

export default function DrawMenu () {
  const { dispatch, options, legend, draw, isDrawMenuExpanded, query, shape, drawTools } = useApp()
  const { id } = options
  const isDetails = ['expanded', 'collapse'].includes(draw?.collapse)
  const { handleAddClick, handleEditClick, handleDeleteClick } = useDrawHandlers()

  // Tools displayed in draw action menu instead
  if (!(legend && draw?.heading)) {
    return null
  }

  const handleDetailsClick = () => {
    dispatch({ type: 'TOGGLE_DRAW_EXPANDED', payload: !isDrawMenuExpanded })
  }

  return (
    <div className='fm-c-menu'>
      <div className={`fm-c-menu__group ${isDrawMenuExpanded ? ' fm-c-menu__group--expanded' : ''}`}>
        {isDetails
          ? (
            <h3 className='fm-c-menu__heading'>
              <button className='fm-c-details' aria-expanded={isDrawMenuExpanded} aria-controls={`content-${id}`} onClick={handleDetailsClick}>
                <span className='fm-c-details__label'>
                  <span className='fm-c-details__label-focus'>{draw?.heading}</span>
                </span>
                <span className='fm-c-details__summary'>
                  <span className='fm-c-details__summary-focus'>{draw?.summary}</span>
                </span>
                <span className='fm-c-details__toggle'>
                  <span className='fm-c-details__toggle-focus'>
                    <span className='fm-c-details__chevron' />
                    {isDrawMenuExpanded ? 'Hide' : 'Show'}
                  </span>
                </span>
              </button>
            </h3>
            )
          : (
            <h3 className='fm-c-menu__heading'>{draw?.heading}</h3>
            )}

        <div className='fm-c-menu__items' {...!isDrawMenuExpanded ? { style: { display: 'none' } } : {}}>
          {[...drawTools, ...defaultTools].map(tool => (
            <div key={tool.id} className='fm-c-menu__item'>
              <button
                className='fm-c-btn-menu'
                aria-disabled={drawTools.includes(tool) ? !!query : !query}
                onClick={() => {
                  if (drawTools.includes(tool) && !query) {
                    handleAddClick(tool.id)
                  }
                  if (tool.id === 'edit' && query) {
                    handleEditClick(shape)
                  }
                  if (tool.id === 'delete' && query) {
                    handleDeleteClick()
                  }
                }}
              >
                <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor' dangerouslySetInnerHTML={{__html: tool.svg}}/>
                <span className='fm-c-btn__label'>
                  {drawTools.includes(tool) ? `Add ${tool.id}` : `${tool.name} shape`}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
