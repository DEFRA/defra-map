import React, { useEffect, useState, useRef } from 'react'
import { useOutsideInteract } from '../hooks/use-outside-interact'
import { useApp } from '../store/use-app'
import { constrainFocus, toggleInert } from '../lib/dom'

export default function Panel ({ className, label, isInset, isFixed, isNotObscure, isHideHeading, isModal, setIsModal, isOutsideInteract, instigatorRef, width, maxWidth, html, children }) {
  const { options, isMobile, dispatch, obscurePanelRef, activeRef, activePanelHasFocus } = useApp()
  const { id } = options

  // Ref to element
  const elementRef = useRef(null)
  const bodyRef = useRef(null)

  // Scroll tabindex
  const [hasTabindex, setHasTabindex] = useState(false)

  // Hide keyboard on click outside
  useOutsideInteract(elementRef, 'click', () => {
    // if (isFixed || e.target !== viewportRef?.current?.querySelector('canvas')) return
    if (isOutsideInteract) {
      handleClose()
    }
  })

  // Events
  const handleClose = () => {
    if (setIsModal) {
      setIsModal(false)
    }
    dispatch({ type: 'CLOSE' })
    obscurePanelRef.current = null
    activeRef.current = instigatorRef.current
  }

  const handleKeyDown = e => {
    constrainFocus(e)
  }

  const handleKeyUp = e => {
    if (['Escape', 'Esc'].includes(e.key)) {
      e.preventDefault()
      handleClose()
    }
  }

  const handleFocus = e => {
    if (e.currentTarget !== e.target) return
    toggleInert()
  }

  // const handleBlur = e => {
  //   if (!(isMobile && elementRef.current?.contains(e.target) && !elementRef.current?.contains(e.relatedTarget))) return
  //   dispatch({ type: 'SET_IS_EXPANDED', value: false })
  // }

  // Template properties
  const panelId = `${id}-panel${className ? '-' + className : ''}`
  const hasCloseBtn = !isFixed && instigatorRef
  const hasWidth = width && !(isMobile && isInset)

  // Set initial focus
  useEffect(() => {
    // We need to know when if a panel ahs been added before rednering map
    dispatch({ type: 'CONTAINER_READY' })

    obscurePanelRef.current = isNotObscure ? elementRef.current : null
    if (instigatorRef?.current && activePanelHasFocus) {
      activeRef.current = elementRef.current
    }
  }, [])

  // Toggle inert elements
  useEffect(() => {
    toggleInert()
  }, [isModal])

  // Conditionally set tabindex on scrollable body
  useEffect(() => {
    const height = bodyRef.current?.offsetHeight
    const scrollHeight = bodyRef.current?.scrollHeight
    const hasInteractions = bodyRef.current?.querySelector('a, button')
    setHasTabindex(!hasInteractions && height < scrollHeight)
  })

  return (
    <div
      id={panelId}
      className={`fm-c-panel${className ? ' fm-c-panel--' + className : ''}${isInset ? ' fm-c-panel--inset' : ''}${hasTabindex ? ' fm-c-panel--has-body-focus' : ''}`}
      aria-labelledby={`${panelId}-label`}
      role={instigatorRef ? 'dialog' : 'region'}
      ref={elementRef}
      // onBlur={handleBlur}
      {...(instigatorRef
        ? {
            open: true,
            'aria-modal': isModal,
            onKeyDown: handleKeyDown,
            onKeyUp: handleKeyUp,
            onFocus: handleFocus,
            tabIndex: '-1'
          }
        : {})}
      {...!isMobile && hasWidth
        ? {
            style: { width, maxWidth }
          }
        : {}}
    >
      <div className={`fm-c-panel__header${isHideHeading ? ' fm-c-panel__header--collapse' : ''}`}>
        <h2 id={`${panelId}-label`} className={isHideHeading ? 'fm-u-visually-hidden' : 'fm-c-panel__heading govuk-heading-s'}>
          {label}
        </h2>
        {hasCloseBtn
          ? (
            <button onClick={handleClose} className='fm-c-btn fm-c-btn--close-panel govuk-body-s' aria-label='Close panel'>
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20'><path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' style={{ fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0.1 }} /></svg>
            </button>
            )
          : null}
      </div>
      <div className='fm-c-panel__body' ref={bodyRef} {...(hasTabindex ? { tabindex: 0 } : {})}>
        {html
          ? <div className='fm-c-panel__content' {...({ dangerouslySetInnerHTML: { __html: html } })} />
          : null}
        {children}
      </div>
    </div>
  )
}
