import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants'
import eventBus from '../lib/eventbus.js'

export default function DrawCancel ({ cancelBtnRef }) {
  const { provider, parent, segments, layers, dispatch, viewportRef } = useApp()
  const { size, basemap } = useViewport()

  const handleClick = () => {
    provider.draw.cancel()
    dispatch({ type: 'SET_MODE', payload: { value: 'default' } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: 'default', basemap, size, segments, layers })
    viewportRef.current.focus()
  }

  return (
    <button onClick={handleClick} aria-label='Cancel' className='fm-c-btn fm-c-btn--secondary govuk-body-s' ref={cancelBtnRef}>
      Cancel
    </button>
  )
}
