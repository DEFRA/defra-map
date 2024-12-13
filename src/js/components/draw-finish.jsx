import React from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants'
import eventBus from '../lib/eventbus.js'

export default function DrawFinish () {
  const { provider, parent, segments, layers, dispatch, viewportRef, query } = useApp()
  const { size, basemap } = useViewport()

  const handleUpdateClick = () => {
    const newQuery = provider.draw.finish()
    dispatch({ type: 'SET_MODE', payload: { value: 'default', query: newQuery } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: 'default', basemap, size, segments, layers })
    viewportRef.current.focus()
  }

  const handleCancelClick = () => {
    provider.draw.cancel()
    dispatch({ type: 'SET_MODE', payload: { value: 'default' } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: 'default', basemap, size, segments, layers })
    viewportRef.current.focus()
  }

  return (
    <div className='fm-o-actions'>
      <button onClick={handleUpdateClick} className='fm-c-btn fm-c-btn--primary govuk-body-s'>
        {`${query ? 'Update' : 'Confirm'}`} area
      </button>
      <button onClick={handleCancelClick} aria-label='Cancel' className='fm-c-btn fm-c-btn--secondary govuk-body-s'>
        Cancel
      </button>
    </div>
  )
}
