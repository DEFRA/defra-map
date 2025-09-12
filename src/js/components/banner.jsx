import React from 'react'
import { useApp } from '../store/use-app.js'

export default function Banner () {
  const { banner, activePanel, isMobile, dispatch, viewportRef } = useApp()

  const html = `<span class="fm-u-visually-hidden">Alert:</span> ${banner?.message}`

  const handleClose = () => {
    dispatch({ type: 'SET_BANNER', payload: null })
    viewportRef.current?.focus()
  }

  return (
    <div className='fm-c-banner'>
      <div className='fm-c-banner__inner' {...!banner || (activePanel === 'SEARCH' && isMobile) ? { style: { display: 'none' } } : {}}>
        <div role='status' className='fm-c-banner__content'>
          <svg width='20' height='20' viewBox='0 0 20 20' aria-hidden>
            <circle cx='10' cy='10' r='8.5' fill='none' stroke='currentColor' strokeWidth='1.5' />
            <path d='M8.584 5.228h2.832v2.174L10.869 11H9.118l-.534-3.598V5.228zm.098 7.207h2.643v2.337H8.682v-2.337z' fill='currentColor' />
          </svg>
          <span dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {banner?.isDismissable && (
          <button onClick={handleClose} className='fm-c-btn' aria-label='Close panel'>
            <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20'><path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' style={{ fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0.1 }} /></svg>
          </button>
        )}
      </div>
    </div>
  )
}
