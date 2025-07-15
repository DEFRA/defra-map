import React, { useEffect, useState } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'
import { getFeatureShape } from '../lib/viewport'
import EditVertex from './edit-vertex.jsx'

const getIsPixelVisible = (interfaceType, isTargetVisible, activePanel) => {
  return interfaceType === 'touch' && isTargetVisible && !activePanel
}

const getIsPolygonVisible = (isDefaultMode, query, activePanel, isMobile) => {
  return isDefaultMode && query && activePanel !== 'INFO' && !(isMobile && activePanel === 'KEY')
}

export default function Actions () {
  const { provider, style, parent, draw, drawTool, drawTools, drawMode, shape, segments, layers, dispatch: appDispatch, viewportRef, query, activePanel, previousPanel, isMobile, interfaceType, isTargetVisible } = useApp()
  const { dispatch: viewportDispatch, size, isDrawValid } = useViewport()
  const [isUpdateDisabled, setIsUpdateDisabled ] = useState(!isDrawValid)
  const hasInspector = activePanel === 'INSPECTOR' || (activePanel === 'STYLE' && previousPanel === 'INSPECTOR')

  const handleUpdateClick = () => {
    if (!(provider.map || drawTool) || !isDrawValid) {
      return
    }
    const feature = provider.draw.finish(shape)
    const newShape = getFeatureShape(feature)
    appDispatch({ type: 'SET_MODE', payload: { value: 'default', query: feature, shape: newShape } })
    viewportDispatch({ type: 'TOGGLE_CONSTRAINTS' })
    eventBus.dispatch(parent, events.APP_ACTION, { type: query ? 'updatePolygon' : 'confirmPolygon', query: feature })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'drawMode', drawMode: 'default', style, size, segments, layers })
    viewportRef.current.focus()
  }

  const handleCancelClick = () => {
    if (drawTool) {
      return
    }
    provider.draw.cancel()
    const shape = getFeatureShape(query) || drawTools[0].id
    eventBus.dispatch(parent, events.APP_ACTION, { type: 'cancelUpdatePolygon', query })
    appDispatch({ type: 'SET_MODE', payload: { value: 'default', shape, query } })
    viewportDispatch({ type: 'TOGGLE_CONSTRAINTS' })
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

  const isDefaultMode = drawMode === 'default'
  const isPixelVisible = getIsPixelVisible(interfaceType, isTargetVisible, activePanel)
  const isPolygonVisible = getIsPolygonVisible(isDefaultMode, query, activePanel, isMobile)
  const hasActions = !isDefaultMode || isPixelVisible || isPolygonVisible
  
  return (
    <div className={`fm-o-actions${hasActions ? ' fm-o-actions--has-actions' : ''}`} {...hasInspector && { style: { display: 'none' } }}>
      <button onClick={handleUpdateClick} className='fm-c-btn-primary' aria-disabled={isUpdateDisabled} {...(isDefaultMode && { style: { display: 'none' } })}>
        <svg width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
          <path d='M17.778 5.757l-9.899 9.9L2.222 10l1.414-1.414 4.243 4.242 8.485-8.485 1.414 1.414z'></path>
        </svg>
        <span>{`${query ? 'Done' : 'Finish'}`}</span>
      </button>
      <EditVertex setIsUpdateDisabled={setIsUpdateDisabled} />
      <button onClick={handleCancelClick} className='fm-c-btn-secondary' {...isDefaultMode && { style: { display: 'none' } }}>
        <svg width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
          <path d='M8.575 9.983L3.266 4.674l1.416-1.416L9.99 8.567l5.304-5.304 1.41 1.41L11.4 9.977l5.309 5.309-1.416 1.416-5.309-5.309-5.304 5.304-1.41-1.41 5.304-5.304z'/>
        </svg>
        <span>Cancel</span>
      </button>
      <button onClick={handlePolygonClick} className='fm-c-btn-primary' {...!isPolygonVisible && { style: { display: 'none' } }}>
        {draw?.queryLabel}
      </button>
      <button onClick={handlePixelClick} className='fm-c-btn-primary' {...(!isPixelVisible && { style: { display: 'none' } })}>
        Get info
      </button>
    </div>
  )
}
