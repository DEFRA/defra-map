import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'

const getIsPixelVisible = (interfaceType, isTargetVisible, activePanel) => {
  return interfaceType === 'touch' && isTargetVisible && !activePanel
}

const getIsPolygonVisible = (isDrawVisible, query, activePanel, isMobile) => {
  return !isDrawVisible && query && activePanel !== 'INFO' && !(isMobile && activePanel === 'KEY')
}

export default function Actions () {
  const { provider, style, parent, mode, segments, layers, dispatch: appDispatch, viewportRef, queryArea, query, activePanel, isMobile, interfaceType, isTargetVisible, hasTargetData } = useApp()
  const { dispatch: viewportDispatch, size } = useViewport()

  const handleUpdateClick = () => {
    const newQuery = provider.draw.finish()
    appDispatch({ type: 'SET_MODE', payload: { value: 'default', query: newQuery } })
    viewportDispatch({ type: 'SWAP_STYLES' })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: 'default', style, size, segments, layers })
    eventBus.dispatch(parent, events.APP_ACTION, { type: query ? 'updatePolygon' : 'confirmPolygon', query: newQuery })
    viewportRef.current.focus()
  }

  const handleCancelClick = () => {
    provider.draw.cancel()
    appDispatch({ type: 'SET_MODE', payload: { value: 'default' } })
    viewportDispatch({ type: 'SWAP_STYLES' })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'mode', mode: 'default', style, size, segments, layers })
    eventBus.dispatch(parent, events.APP_ACTION, { type: 'cancelUpdatePolygon', query })
    viewportRef.current.focus()
  }

  const handlePixelClick = () => {
    const event = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    viewportRef.current.dispatchEvent(event)
  }

  const handlePolygonClick = () => {
    eventBus.dispatch(parent, events.APP_QUERY, { resultType: 'polygon', query, style, size, segments, layers })
  }

  const isDrawVisible = ['frame', 'draw'].includes(mode)
  const isPixelVisible = getIsPixelVisible(interfaceType, isTargetVisible, activePanel)
  const isPolygonVisible = getIsPolygonVisible(isDrawVisible, query, activePanel, isMobile)
  const hasActions = isDrawVisible || isPixelVisible || isPolygonVisible

  return (
    <div className={`fm-o-actions${hasActions ? ' fm-o-actions--has-actions' : ''}`}>
      <button onClick={handleUpdateClick} className='fm-c-btn fm-c-btn--primary' {...(!isDrawVisible && { style: { display: 'none' } })}>
        {`${query ? 'Update' : 'Confirm'}`} area
      </button>
      <button onClick={handleCancelClick} aria-label='Cancel' className='fm-c-btn fm-c-btn--secondary' {...(!isDrawVisible && { style: { display: 'none' } })}>
        Cancel
      </button>
      <button onClick={handlePolygonClick} className='fm-c-btn fm-c-btn--primary' {...(!isPolygonVisible && { style: { display: 'none' } })}>
        {queryArea?.submitLabel}
      </button>
      <button onClick={handlePixelClick} className='fm-c-btn fm-c-btn--primary' {...(!isPixelVisible && { style: { display: 'none' } })} {...!hasTargetData && { 'aria-disabled': true }}>
        Get feature information
      </button>
    </div>
  )
}
