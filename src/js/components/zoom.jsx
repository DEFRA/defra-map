import React from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import Tooltip from './tooltip.jsx'

export default function Zoom () {
  const { options, isMobile } = useApp()
  const { id, maxZoom, minZoom } = options
  const { zoom } = useViewport()
  const viewportDispatch = useViewport().dispatch

  if (isMobile) {
    return null
  }

  return (
    <div className='fm-c-zoom'>
      <Tooltip id={`${id}-zoom-in-label`} position='left' text='Zoom in'>
        <button onClick={() => { viewportDispatch({ type: 'ZOOM_IN' }) }} className='fm-c-btn fm-c-btn--zoom-in' aria-disabled={zoom >= maxZoom} aria-labelledby={`${id}-zoom-in-label`} aria-controls={`${id}-viewport`}>
          <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' style={{ fill: 'currentColor', fillRule: 'evenodd', clipRule: 'evenodd' }}><rect x='3' y='9' width='14' height='2' /><rect x='9' y='3' width='2' height='14' /></svg>
        </button>
      </Tooltip>
      <Tooltip id={`${id}-zoom-out-label`} position='left' text='Zoom out'>
        <button onClick={() => { viewportDispatch({ type: 'ZOOM_OUT' }) }} className='fm-c-btn fm-c-btn--zoom-out' aria-disabled={zoom <= minZoom} aria-labelledby={`${id}-zoom-out-label`} aria-controls={`${id}-viewport`} data-fm-zoom-out-btn>
          <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' style={{ fill: 'currentColor', fillRule: 'evenodd', clipRule: 'evenodd' }}><rect x='3' y='9' width='14' height='2' /></svg>
        </button>
      </Tooltip>
    </div>
  )
}
