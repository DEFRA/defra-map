import React, { useEffect, useState } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { events } from '../store/constants.js'
import eventBus from '../lib/eventbus.js'
import { getFeatureShape } from '../lib/viewport'

const getIsPixelVisible = (interfaceType, isTargetVisible, activePanel) => {
  return interfaceType === 'touch' && isTargetVisible && !activePanel
}

const getIsPolygonVisible = (isDefaultMode, query, activePanel, isMobile) => {
  return isDefaultMode && query && activePanel !== 'INFO' && !(isMobile && activePanel === 'KEY')
}

export default function Actions () {
  const { provider, style, parent, draw, drawTool, drawTools, drawMode, shape, segments, layers, dispatch: appDispatch, viewportRef, query, activePanel, isMobile, interfaceType, isTargetVisible } = useApp()
  const { dispatch: viewportDispatch, size, isDrawValid } = useViewport()
  const [vertexButtonAction, setVertexButtonAction ] = useState(query ? 'delete' : 'add')
  const [numVertecies, setNumVertecies ] = useState(null)

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

  const handleDrawEvent = e => {
    const { action } = e.detail
    if (['add', 'delete'].includes(action)) {
      const feature = e.detail.feature
      const numCoords = feature?.type === 'Polygon' ? feature?.coordinates[0].length : -1
      setVertexButtonAction(e.detail.action)
      setNumVertecies(numCoords)      
    }
    if (action === 'change') {
      setNumVertecies(e.detail.numVertecies) 
    }
  }

  const isDefaultMode = drawMode === 'default'
  const isVertexTouch = drawMode === 'vertex' && interfaceType === 'touch'
  const isPixelVisible = getIsPixelVisible(interfaceType, isTargetVisible, activePanel)
  const isPolygonVisible = getIsPolygonVisible(isDefaultMode, query, activePanel, isMobile)
  const hasActions = !isDefaultMode || isPixelVisible || isPolygonVisible
  const isUpdateDisabled = !isDrawValid || numVertecies < 3
  const isDeleteDisabled = vertexButtonAction === 'delete' && numVertecies < 4

  useEffect(() => {
    provider.addEventListener('draw', handleDrawEvent)
  }, [])

  return (
    <div className={`fm-o-actions${hasActions ? ' fm-o-actions--has-actions' : ''}`}>
      {provider.capabilities?.hasInclusiveDraw && (
        <button className='fm-c-btn-primary' {...(!isVertexTouch && { style: { display: 'none' } })} aria-disabled={isDeleteDisabled} data-vertex-button={true}>
          {`${vertexButtonAction === 'delete' ? 'Delete point' : 'Add point'}`}
        </button>
      )}
      <button onClick={handleUpdateClick} className='fm-c-btn-primary' aria-disabled={isUpdateDisabled} {...(isDefaultMode && { style: { display: 'none' } })}>
        {`${query ? 'Done' : 'Finish'}`}
      </button>
      <button onClick={handleCancelClick} className='fm-c-btn-secondary' {...(isDefaultMode && { style: { display: 'none' } })}>
        Cancel
      </button>
      <button onClick={handlePolygonClick} className='fm-c-btn-primary' {...(!isPolygonVisible && { style: { display: 'none' } })}>
        {draw?.queryLabel}
      </button>
      <button onClick={handlePixelClick} className='fm-c-btn-primary' {...(!isPixelVisible && { style: { display: 'none' } })}>
        Get info
      </button>
    </div>
  )
}
