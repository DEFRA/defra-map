import { useEffect, useState, useRef } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { isSame } from '../lib/utils'
import { getStatus } from '../lib/viewport'

export function useStatus () {
  const { interfaceType, featureId } = useApp()
  const state = useViewport()
  const [message, setMessage] = useState('')
  const prevStateRef = useRef(null)

  useEffect(() => {
    if (!state.isNewStatus) {
      return
    }

    const { dispatch, bounds, features } = state
    const isBoundsChange = !isSame(prevStateRef.current?.bounds, bounds)
    const isFocusArea = interfaceType === 'keyboard' && features?.isFeaturesInMap
    const { zoom: prevZoom, center: prevCenter } = prevStateRef.current ?? {}
    console.log('***', prevCenter, state.center)
    const status = getStatus({ ...state, isBoundsChange, prevZoom, prevCenter, isFocusArea, featureId })
    setMessage(status)
    prevStateRef.current = state
    dispatch({ type: 'RESET_STATUS' })
  }, [state.isNewStatus])

  return message
}
