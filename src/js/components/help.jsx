import React, { useEffect, useRef } from 'react'
import { useOutsideInteract } from '../hooks/use-outside-interact'
import { toggleInert } from '../lib/dom'
import { useApp } from '../store/use-app'

export default function Help ({ instigatorRef, focusRef, heading, body }) {
  const { isMobile, dispatch, options, activeRef, viewportRef, isDesktop } = useApp()
  const { id, legend } = options

  // Ref to element
  const elementRef = useRef(null)
  const isModal = isMobile || (legend.display !== 'inset' && !isDesktop)

  // Hide keyboard on click outside
  useOutsideInteract(elementRef, 'click', e => {
    if (isDesktop || e.target !== viewportRef?.current?.querySelector('canvas')) {
      return
    }
    handleClose()
  })

  // Events
  const handleClose = () => {
    dispatch({ type: 'CLOSE' })
    activeRef.current = instigatorRef?.current
  }

  const handleKeyUp = e => {
    if (['Escape', 'Esc'].includes(e.key)) {
      e.preventDefault()
      handleClose()
    }
  }

  // const handleBlur = e => {
  //   if (!(isMobile && elementRef.current.contains(e.target) && !elementRef.current.contains(e.relatedTarget))) return
  //   dispatch({ type: 'SET_IS_EXPANDED', payload: false })
  // }

  // Set intial focus
  useEffect(() => {
    activeRef.current = focusRef?.current || elementRef.current
  }, [])

  // Toggle inert elements
  useEffect(() => {
    toggleInert()
  }, [isModal])

  const panelId = `${id}-panel-help`
  const hasWidth = legend.width && !(isMobile && legend.display === 'inset')

  return (
    <div
      id={panelId}
      className='fm-c-panel fm-c-panel--help'
      aria-labelledby={`${panelId}-label`}
      role={isModal ? 'dialog' : 'region'}
      {...isModal && {
        open: true,
        'aria-modal': true
      }}
      ref={elementRef}
      // onBlur={handleBlur}
      onKeyUp={handleKeyUp}
      tabIndex='-1'
      {...hasWidth && {
        style: { width: legend.width }
      }}
    >
      <div className='fm-c-panel__header'>
        <h2 id={`${panelId}-label`} className='fm-c-panel__heading govuk-heading-m'>
          {heading}
        </h2>
        {!isDesktop && (
          <button onClick={handleClose} className='fm-c-btn fm-c-btn--close-panel govuk-body-s' aria-label='Close panel'>
            <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20'><path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' style={{ fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0.1 }} /></svg>
          </button>
        )}
      </div>
      <div className='fm-c-panel__body'>
        <div className='fm-c-panel__content' {...({ dangerouslySetInnerHTML: { __html: body } })} />
      </div>
    </div>
  )
}
