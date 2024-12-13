import React from 'react'
import { useApp } from '../store/use-app.js'
import eventBus from '../lib/eventbus.js'
import { events } from '../store/constants.js'

export default function PolygonQueryButton () {
  const { parent, mode, queryPolygon, query, activePanel, isMobile } = useApp()

  const handleOnClick = () => {
    const detail = { resultType: 'polygon', query }
    eventBus.dispatch(parent, events.APP_QUERY, detail)
  }

  const isQueryMode = ['frame', 'draw'].includes(mode)
  const isVisible = !isQueryMode && query && activePanel !== 'INFO' && !(isMobile && activePanel === 'KEY')

  return (
    <button onClick={handleOnClick} className={`fm-c-btn fm-c-btn--primary`} {...(!isVisible && { 'style': { display: 'none' } })}>
      {queryPolygon?.submitLabel}
    </button>
  )
}
