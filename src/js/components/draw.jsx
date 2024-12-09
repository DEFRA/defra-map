import React, { useRef } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'
import { isFeatureSquare } from '../lib/viewport.js'

export default function Draw () {
  const { provider, parent, queryPolygon, segments, layers, dispatch, query, activeRef, viewportRef } = useApp()
  const { size, basemap } = useViewport()

  const startBtnRef = useRef(null)

  const isFrameMode = !query || (query && isFeatureSquare(query))
  const drawMode = isFrameMode ? 'frame' : 'draw'

  const handleStartClick = () => {
    provider.draw?.start ? provider.draw.start(drawMode) : provider.initDraw(queryPolygon)
    dispatch({ type: 'SET_MODE', payload: { value: drawMode, query } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: drawMode, basemap, size, segments, layers })
    activeRef.current = viewportRef.current
    activeRef.current.focus()
  }

  const handleDeleteClick = () => {
    provider.draw.delete()
    dispatch({ type: 'SET_MODE', payload: { query: null } })
    activeRef.current = viewportRef.current
    activeRef.current.focus()
  }

  return (
    <div className='fm-c-menu__group'>
      <h2 className='fm-c-menu__heading govuk-body-s'>{queryPolygon.heading}</h2>
      <div className='fm-c-menu__item'>
        <button className='fm-c-btn-menu govuk-body-s' onClick={handleStartClick} ref={startBtnRef}>
          {isFrameMode
            ? (
              <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20'>
                <path d='M16 6v7.996M14 16H6m-2-2.004V6m2-2h8' fill='none' stroke='currentColor' strokeWidth='2' />
                <path d='M2.081 2H6v4H2.081zm0 12H6v4H2.081zm11.96-12h3.919v4h-3.919zm0 11.996h3.919v4h-3.919z' fill='currentColor' stroke='none' />
              </svg>
              )
            : (
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M16 6v7.996M14 16H6m-2-2.004V6m2-2h8' />
                <circle cx='4' cy='4' r='2' />
                <circle cx='4' cy='15.996' r='2' />
                <circle cx='16' cy='4' r='2' />
                <circle cx='16' cy='15.996' r='2' />
              </svg>
              )}
          <span className='fm-c-btn__label'>
            {`${query ? 'Edit' : 'Add'}`} area
          </span>
        </button>
      </div>
      {query && (
        <div className='fm-c-menu__item'>
          <button className='fm-c-btn-menu govuk-body-s' onClick={handleDeleteClick}>
            <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
              <path d='M3 5.963H2V3.989h4V2h8v1.989h4v1.974h-.956V18H3V5.963zm12 0H5.044v10.063H15V5.963z' fill='currentColor' />
              <path d='M6.953 7L7 15m2.977-8l.046 8m2.954-8l.046 8' fill='none' stroke='currentColor' strokeWidth='2' />
            </svg>
            <span className='fm-c-btn__label'>
              Delete area
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
