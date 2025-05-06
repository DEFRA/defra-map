import React, { useRef } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'

export default function Menu () {
  const { provider, parent, queryArea, segments, layers, dispatch: appDispatch, query, shape, drawMode, drawModes, activeRef, viewportRef } = useApp()
  const { styles, minZoom, maxZoom } = queryArea
  const { dispatch: viewportDispatch, size, style } = useViewport()
  const startBtnRef = useRef(null)

  const handleStartClick = () => {
    const mode = drawModes.find(m => m.id === shape)?.mode || 'frame'
    appDispatch({ type: 'SET_MODE', payload: { value: mode, query } })
    viewportDispatch({ type: 'SWAP_STYLES', payload: { styles, minZoom, maxZoom } })
    provider.draw?.edit(mode, shape)
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode, style, size, segments, layers })
    activeRef.current = viewportRef.current
    activeRef.current?.focus()
  }

  const handleDeleteClick = () => {
    provider.draw.delete()
    const defaultShape = drawMode || drawModes[0].id
    appDispatch({ type: 'SET_MODE', payload: { value: 'default', query: null, shape: defaultShape } })
    eventBus.dispatch(parent, events.APP_ACTION, { type: 'deletePolygon', query })
    activeRef.current = viewportRef.current
    activeRef.current?.focus()
  }

  const buttonPath = drawModes.find(m => m.id === shape)?.path

  return (
    <div className='fm-c-menu'>
      <div className='fm-c-menu__group'>
        <h3 className='fm-c-menu__heading'>{queryArea.heading}</h3>
        <div className='fm-c-menu__item'>
          <button className='fm-c-btn-menu' onClick={handleStartClick} ref={startBtnRef}>
            <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
              <path d={buttonPath} />
            </svg>
            <span className='fm-c-btn__label'>
              {`${query ? 'Edit' : 'Add'} ${shape}`}
            </span>
          </button>
        </div>
        {query && (
          <div className='fm-c-menu__item'>
            <button className='fm-c-btn-menu' onClick={handleDeleteClick}>
              <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
                <path d='M3 5.963H2V3.989h4V2h8v1.989h4v1.974h-.956V18H3V5.963zm12 0H5.044v10.063H15V5.963z' fill='currentColor' />
                <path d='M6.953 7L7 15m2.977-8l.046 8m2.954-8l.046 8' fill='none' stroke='currentColor' strokeWidth='2' />
              </svg>
              <span className='fm-c-btn__label'>
                Delete shape
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
