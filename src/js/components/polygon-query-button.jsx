import React from 'react'
import { useApp } from '../store/use-app.js'
import eventBus from '../lib/eventbus.js'
import { events } from '../store/constants.js'

export default function PolygonQueryButton () {
  const { parent, queryPolygon, query } = useApp()

  const handleOnClick = () => {
    const detail = { resultType: 'polygon', query }
    eventBus.dispatch(parent, events.APP_QUERY, detail)
  }

  return (
    <div className='fm-o-actions'>
      <button onClick={handleOnClick} className='fm-c-btn fm-c-btn--primary govuk-body-s'>
        {queryPolygon.submitLabel}
      </button>
    </div>
  )
}
