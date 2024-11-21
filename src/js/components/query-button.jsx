import React from 'react'
import { useApp } from '../store/use-app'
import eventBus from '../lib/eventbus.js'
import { events } from '../store/constants.js'

export default function QueryButton () {
  const { parent, queryPolygon, query } = useApp()

  const handleOnClick = () => {
    const detail = { resultType: 'polygon', query }
    eventBus.dispatch(parent, events.APP_QUERY, detail)
  }

  return (
    <button onClick={handleOnClick} className='fm-c-btn fm-c-btn--primary govuk-body-s'>
      {queryPolygon.submitLabel}
    </button>
  )
}
