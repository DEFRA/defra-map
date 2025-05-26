import React, { useRef } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'

export default function Menu () {
  const { provider, parent, draw, segments, layers, dispatch: appDispatch, query, shape, drawTool, drawTools, activeRef, viewportRef } = useApp()
  const { styles, minZoom, maxZoom } = draw
  const { dispatch: viewportDispatch, size, style } = useViewport()
  const startBtnRef = useRef(null)

  const handleStartClick = () => {
    if (!provider.map) {
      return
    }
    const drawMode = drawTools.find(m => m.id === shape)?.drawMode || 'frame'
    provider.draw?.edit(drawMode, shape)
    appDispatch({ type: 'SET_MODE', payload: { value: drawMode, query } })
    viewportDispatch({ type: 'SWAP_STYLES', payload: { styles, minZoom, maxZoom } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'drawMode', drawMode, style, size, segments, layers })
    activeRef.current = viewportRef.current
    activeRef.current?.focus()
  }

  const handleDeleteClick = () => {
    if (!provider.map) {
      return
    }
    provider.draw.delete()
    const defaultShape = drawTool || drawTools[0].id
    appDispatch({ type: 'SET_MODE', payload: { value: 'default', query: null, shape: defaultShape } })
    eventBus.dispatch(parent, events.APP_ACTION, { type: 'deletePolygon', query })
    activeRef.current = viewportRef.current
    activeRef.current?.focus()
  }

  return (
    <div className='fm-c-menu'>
      <div className='fm-c-menu__group'>
        <h3 className='fm-c-menu__heading'>{draw.heading}</h3>
        <div className='fm-c-menu__item'>
          <button className='fm-c-btn-menu' onClick={handleStartClick} ref={startBtnRef}>
            <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
              {query
                ? (
                  <path d='M11.298 4.666l3.536 3.536-7.071 7.071-3.536-3.536 7.071-7.071zm2.475-2.475a1.5 1.5 0 0 1 2.121 0l1.415 1.415a1.5 1.5 0 0 1 0 2.121l-1.768 1.768-3.536-3.536 1.768-1.768zM3.52 12.444l3.536 3.536-5.304 1.768 1.768-5.304z' fill='currentColor' stroke='none' />
                  )
                : (
                  <path d='M18 18H2V2h16v16zM16 4H4v12h12V4zm-7 7H7V9h2V7h2v2h2v2h-2v2H9v-2z' />
                  )}
            </svg>
            <span className='fm-c-btn__label'>
              {query ? 'Edit shape' : 'Add shape'}
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
