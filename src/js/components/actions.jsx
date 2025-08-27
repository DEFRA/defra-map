import React, { useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'

const getIsPixelVisible = (interfaceType, isTargetVisible, activePanel) => {
  return interfaceType === 'touch' && isTargetVisible && !activePanel
}

const getIsPolygonVisible = (isDefaultMode, query, activePanel, isMobile) => {
  return isDefaultMode && query && activePanel !== 'INFO' && !(isMobile && activePanel === 'KEY')
}

export default function Actions () {
  const { provider, style, parent, queryArea, mode, shape, segments, layers, dispatch: appDispatch, viewportRef, query, activePanel, previousPanel, isMobile, interfaceType, isTargetVisible, warningText } = useApp()
  const { dispatch: viewportDispatch, size, dimensions } = useViewport()
  const hasInspector = activePanel === 'INSPECTOR' || (activePanel === 'STYLE' && previousPanel === 'INSPECTOR')
  const isValid = dimensions.area && (!warningText || dimensions.allowShape !== false)

  const handleUpdateClick = () => {
    if (!provider.map || !isValid) {
      return
    }
    const feature = provider.draw.finish(shape)
    appDispatch({ type: 'SET_MODE', payload: { value: 'default', shape, query: feature } })
    viewportDispatch({ type: 'SWAP_STYLES' })
    eventBus.dispatch(parent, events.APP_ACTION, { type: query ? 'updatePolygon' : 'confirmPolygon', query: feature })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'drawMode', drawMode: 'default', style, size, segments, layers })
    viewportRef.current.focus()
  }

  const handleCancelClick = () => {
    provider.draw.cancel()
    eventBus.dispatch(parent, events.APP_ACTION, { type: 'cancelUpdatePolygon', query })
    appDispatch({ type: 'SET_MODE', payload: { value: 'default', shape, query } })
    viewportDispatch({ type: 'SWAP_STYLES' })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'drawMode', drawMode: 'default', style, size, segments, layers })
    viewportRef.current.focus()
  }

  const handlePixelClick = () => {
    const event = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    viewportRef.current.dispatchEvent(event)
  }

  const handlePolygonClick = () => {
    eventBus.dispatch(parent, events.APP_QUERY, { resultType: 'polygon', query, style, size, segments, layers })
  }

  const isDefaultMode = mode === 'default'
  const isPixelVisible = getIsPixelVisible(interfaceType, isTargetVisible, activePanel)
  const isPolygonVisible = getIsPolygonVisible(isDefaultMode, query, activePanel, isMobile)
  const hasActions = !isDefaultMode || isPixelVisible || isPolygonVisible

  return (
    <div className={`fm-o-actions${hasActions ? ' fm-o-actions--has-actions' : ''}`} {...hasInspector && { style: { display: 'none' } }}>
      <button onClick={handleUpdateClick} className='fm-c-btn fm-c-btn--primary' {...!isValid && {'aria-disabled' : true }} {...isDefaultMode && { style: { display: 'none' } }}>
        <span>{`${query ? 'Done' : 'Finish'}`}</span>
      </button>
      <button onClick={handleCancelClick} className='fm-c-btn fm-c-btn--secondary' {...isDefaultMode && { style: { display: 'none' } }}>
        <span>Cancel</span>
      </button>
      <button onClick={handlePolygonClick} className='fm-c-btn fm-c-btn--primary' {...!isPolygonVisible && { style: { display: 'none' } }}>
        {queryArea?.submitLabel}
      </button>
      <button onClick={handlePixelClick} className='fm-c-btn fm-c-btn--primary' {...(!isPixelVisible && { style: { display: 'none' } })}>
        Get info
      </button>
    </div>
  )
}