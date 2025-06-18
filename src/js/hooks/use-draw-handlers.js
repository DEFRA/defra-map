import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { events } from '../store/constants'
import eventBus from '../lib/eventbus'

export function useDrawHandlers () {
  const { provider, parent, draw, segments, layers, dispatch, query, drawTools, activeRef, viewportRef } = useApp()
  const { dispatch: viewportDispatch, size, style } = useViewport()
  const { styles, minZoom, maxZoom } = draw || {}

  const handleAddClick = ({ shapeId, interfaceType }) => {
    if (!provider.map) {
      return
    }
    const drawMode = drawTools.find(m => m.id === shapeId)?.drawMode || 'frame'
    provider.draw?.add(drawMode, shapeId, interfaceType)
    dispatch({ type: 'SET_MODE', payload: { value: drawMode, shape: shapeId, query } })
    viewportDispatch({ type: 'TOGGLE_CONSTRAINTS', payload: { styles, minZoom, maxZoom } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'drawMode', drawMode, style, size, segments, layers })
    activeRef.current = viewportRef.current
    activeRef.current?.focus()
  }

  const handleEditClick = ({ shapeId, interfaceType }) => {
    if (!provider.map) {
      return
    }
    const drawMode = drawTools.find(m => m.id === shapeId)?.drawMode || 'frame'
    provider.draw?.edit(drawMode, shapeId, interfaceType)
    dispatch({ type: 'SET_MODE', payload: { value: drawMode, shape: shapeId, query } })
    viewportDispatch({ type: 'TOGGLE_CONSTRAINTS', payload: { styles, minZoom, maxZoom } })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'drawMode', drawMode, style, size, segments, layers })
    activeRef.current = viewportRef.current
    activeRef.current?.focus()
  }

  const handleDeleteClick = () => {
    if (!provider.map) {
      return
    }
    provider.draw.delete()
    dispatch({ type: 'SET_MODE', payload: { value: 'default', query: null } })
    eventBus.dispatch(parent, events.APP_ACTION, { type: 'deletePolygon', query })
    activeRef.current = viewportRef.current
    activeRef.current?.focus()
  }

  return {
    // query,
    // drawTools,
    handleAddClick,
    handleEditClick,
    handleDeleteClick
  }
}
