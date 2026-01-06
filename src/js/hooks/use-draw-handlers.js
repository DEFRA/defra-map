import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { events } from '../store/constants'
import eventBus from '../lib/eventbus'

export function useDrawHandlers () {
  const { provider, parent, queryArea, segments, layers, dispatch, query, drawTools, activeRef, viewportRef } = useApp()
  const { dispatch: viewportDispatch, size, style } = useViewport()
  const { styles, minZoom, maxZoom } = queryArea || {}

  const handleAddClick = async ({ shapeId, interfaceType }) => {
    if (!provider.map) {
      return
    }
    const drawMode = drawTools.find(m => m.id === shapeId)?.drawMode || 'frame'
    provider.initDraw({ ...queryArea, drawMode, shapeId, interfaceType }, () => {
      dispatch({ type: 'SET_MODE', payload: { value: drawMode, shape: shapeId, query } })
      viewportDispatch({ type: 'SWAP_STYLES', payload: { styles, minZoom, maxZoom } })
      provider.draw.add(drawMode, shapeId, interfaceType)
      eventBus.dispatch(parent, events.APP_CHANGE, { type: 'drawMode', drawMode, style, size, segments, layers })
      activeRef.current = viewportRef.current
      activeRef.current?.focus()
    })
  }

  const handleEditClick = ({ shapeId, interfaceType }) => {
    if (!provider.map) {
      return
    }
    const drawMode = drawTools.find(m => m.id === shapeId)?.drawMode || 'frame'
    provider.draw.edit(drawMode, shapeId, interfaceType)
    dispatch({ type: 'SET_MODE', payload: { value: drawMode, shape: shapeId, query } })
    viewportDispatch({ type: 'SWAP_STYLES', payload: { styles, minZoom, maxZoom } })
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
    handleAddClick,
    handleEditClick,
    handleDeleteClick
  }
}
