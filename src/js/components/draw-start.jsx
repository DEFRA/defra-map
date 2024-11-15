import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'

export default function DrawStart () {
  const { provider, parent, queryPolygon, mode, segments, layers, dispatch, query } = useApp()
  const { size, basemap } = useViewport()

  const handleClick = () => {
    // Dynamic import of draw module
    const isFrame = true // mode === 'frame' // !!query
    provider.draw?.start ? provider.draw.start(isFrame) : provider.initDraw(queryPolygon, query)
    dispatch({ type: 'SET_MODE', payload: { value: 'frame', query } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: 'frame', basemap, size, segments, layers })
  }

  return (
    <div className='fm-c-draw'>
      {/* <h2 className='fm-c-draw__heading govuk-body-s'>{ draw.heading }</h2> */}
      <button className='fm-c-btn-draw govuk-body-s' {...mode === 'frame' ? { 'aria-disabled': true } : {}} onClick={handleClick}>
        {query ? queryPolygon.editLabel : queryPolygon.startLabel}
      </button>
    </div>
  )
}
