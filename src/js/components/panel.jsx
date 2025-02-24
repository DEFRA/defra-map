import React, { useEffect, useRef } from 'react'
import { useOutsideInteract } from '../hooks/use-outside-interact'
import { useApp } from '../store/use-app'
import { constrainFocus, toggleInert } from '../lib/dom'

const getClassNames = (className, isInset) => {
  return `fm-c-panel${className ? ' fm-c-panel--' + className : ''}${isInset ? ' fm-c-panel--inset' : ''}`
}

const getRole = (instigatorRef) => {
  return instigatorRef ? 'dialog' : 'region'
}

const getProps = (id, className, isFixed, isMobile, isInset, instigatorRef, width) => {
  const panelId = `${id}-panel${className ? '-' + className : ''}`
  const hasCloseBtn = !isFixed && instigatorRef
  const hasWidth = width && !(isMobile && isInset)
  return { panelId, hasCloseBtn, hasWidth }
}

export default function Panel ({ className, label, isInset, isFixed, isNotObscure, isHideHeading, isModal, instigatorRef, width, maxWidth, html, children }) {
  const { options, isMobile, dispatch, obscurePanelRef, activeRef, activePanelHasFocus } = useApp()
  const { id } = options

  // Ref to element
  const elementRef = useRef(null)
  const bodyRef = useRef(null)

  useOutsideInteract(elementRef, isModal, 'pointerdown', () => {
    if (isModal) {
      handleClose()
    }
  })

  const handleClose = () => {
    dispatch({ type: 'CLOSE' })
    obscurePanelRef.current = null
    activeRef.current = instigatorRef?.current
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
    if (e.currentTarget === e.target) {
      toggleInert()
    }
  }

  // Template properties
  const { panelId, hasCloseBtn, hasWidth } = getProps(id, className, isFixed, isMobile, isInset, instigatorRef, width)

  // Container is now ready
  useEffect(() => {
    // We need to know when/if a panel has been added before rendering map to calculate padding
    dispatch({ type: 'CONTAINER_READY' })
    // Ref to the obscurring panel so that it can be used calculate offsets
    obscurePanelRef.current = isNotObscure ? elementRef.current : null
  }, [])

  // Toggle inert elements
  useEffect(() => {
    toggleInert()
  }, [isModal])

  // Conditionally set activeRef to panel
  useEffect(() => {
    if (instigatorRef?.current && activePanelHasFocus) {
      activeRef.current = elementRef.current
    }
  })

  // Set tabindex on scrollable body
  useEffect(() => {
    const height = bodyRef.current?.offsetHeight
    const scrollHeight = bodyRef.current?.scrollHeight
    const hasInteractions = bodyRef.current?.querySelector('a, button')
    const tabIndex = (!hasInteractions && height < scrollHeight) ? 0 : -1
    bodyRef.current.tabIndex = tabIndex
  })

  return (
    <>
      <div
        id={panelId}
        className={getClassNames(className, isInset)}
        aria-labelledby={`${panelId}-label`}
        role={getRole(instigatorRef)}
        ref={elementRef}
        {...(instigatorRef && {
          open: true,
          'aria-modal': isModal,
          onKeyDown: handleKeyDown,
          onKeyUp: handleKeyUp,
          onFocus: handleFocus,
          tabIndex: '-1'
        })}
        {...!isMobile && hasWidth && {
          style: { width, maxWidth }
        }}
      >
        <div className={`fm-c-panel__header${isHideHeading ? ' fm-c-panel__header--collapse' : ''}`}>
          <h2 id={`${panelId}-label`} className={isHideHeading ? 'fm-u-visually-hidden' : 'fm-c-panel__heading'}>
            {label}
          </h2>
          {hasCloseBtn && (
            <button onClick={handleClose} className='fm-c-btn fm-c-btn--close-panel' aria-label='Close panel'>
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20'><path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' style={{ fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0.1 }} /></svg>
            </button>
          )}
        </div>
        <div className='fm-c-panel__body' ref={bodyRef}>
          {html && (
            <div className='fm-c-panel__content' {...({ dangerouslySetInnerHTML: { __html: html } })} />
          )}
          {children}
        </div>
      </div>
      {isModal && (
        <div className='fm-c-panel-mask' />
      )}
    </>
  )
}
