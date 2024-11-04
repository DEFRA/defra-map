import React from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants'
import eventBus from '../lib/eventbus.js'

export default function DrawFinish () {
  const { provider, parent, queryPolygon, mode, segments, layers, dispatch, viewportRef, query } = useApp()
  const { size, basemap } = useViewport()

  if (!mode) return

  const handleClick = () => {
    const feature = provider.draw.finish()
    dispatch({ type: 'SET_MODE', payload: {value: 'default', query: feature, isFrameVisible: false }})
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: 'default', basemap, size, segments, layers })
    viewportRef.current.focus()
  }

  return (
    <button onClick={handleClick} className='fm-c-btn fm-c-btn--primary govuk-body-s'>
      {query ? queryPolygon.updateLabel : queryPolygon.addLabel}
    </button>
  )
}
