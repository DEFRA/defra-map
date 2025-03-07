import React from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import Tooltip from './tooltip.jsx'

const { sessionStorage } = window

export default function Location () {
  const { provider, options, mode } = useApp()
  const { id } = options
  const appDispatch = useApp().dispatch
  const viewportDispatch = useViewport().dispatch
  const isQueryMode = ['frame', 'draw'].includes(mode)

  if (!(options.hasGeoLocation && !isQueryMode)) {
    return null
  }

  // Set initial geo location
  const handleGeoLocationSuccess = (coord, place) => {
    const hasSession = !!sessionStorage.getItem('geoloc')
    sessionStorage.setItem('geoloc', JSON.stringify({ coord, place }))
    if (hasSession) {
      return
    }
    viewportDispatch({ type: 'GEOLOC', payload: { center: coord, place } })
  }

  const handleGeoLocationError = (err) => {
    viewportDispatch({ type: 'CLEAR_STATUS' })
    appDispatch({ type: 'ERROR', payload: { label: 'Can\'t get location', message: err.message } })
  }

  // Reset viewport
  const handleOnClick = () => {
    const geoloc = JSON.parse(sessionStorage.getItem('geoloc'))
    if (geoloc) {
      viewportDispatch({ type: 'GEOLOC', payload: { center: geoloc.coord, place: geoloc.place } })
      return
    }
    provider.getGeoLocation(handleGeoLocationSuccess, handleGeoLocationError)
    viewportDispatch({ type: 'UPDATE_STATUS', payload: { status: 'Getting location', isStatusVisuallyHidden: false } })
  }

  return (
    <Tooltip id={`${id}-location-label`} cssModifier='location' position='left' text='Use your location'>
      <button onClick={handleOnClick} className='fm-c-btn fm-c-btn--location' aria-labelledby={`${id}-location-label`} aria-controls={`${id}-viewport`}>
        <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
          <g fill='none' stroke='currentColor' strokeWidth='2'>
            <circle cx='10' cy='10' r='6' />
            <path d='M10 4V1m0 18v-3m6-6h3M1 10h3' strokeLinecap='butt' />
          </g>
          <circle cx='10' cy='10' r='3' fill='currentColor' />
        </svg>
      </button>
    </Tooltip>
  )
}
