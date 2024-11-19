import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'
import { isFeatureSquare } from '../lib/viewport.js'

export default function Draw () {
  const { provider, parent, queryPolygon, mode, segments, layers, dispatch, query } = useApp()
  const { size, basemap } = useViewport()

  const isFrameMode = !query || (query && isFeatureSquare(query))
  const drawMode = isFrameMode ? 'frame' : 'draw'

  const handleClick = () => {
    provider.draw?.start ? provider.draw.start(drawMode) : provider.initDraw(queryPolygon)
    dispatch({ type: 'SET_MODE', payload: { value: drawMode, query } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: drawMode, basemap, size, segments, layers })
  }

  return (
    <div className='fm-c-menu__group'>
      <h2 className='fm-c-menu__heading govuk-body-s'>{ queryPolygon.heading }</h2>
      <div className='fm-c-menu__item'>
        <button className='fm-c-btn-menu govuk-body-s' {...mode === 'frame' ? { 'aria-disabled': true } : {}} onClick={handleClick}>
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
            {query ? queryPolygon.editLabel : queryPolygon.startLabel}
          </span>
        </button>
      </div>
    </div>
  )
}
