import React, { useRef, useState, useEffect, cloneElement } from 'react'
import { useApp } from '../../store/appContext'
import { getTooltipPosition } from './getTooltipPosition.js'

let tooltipIdCounter = 0
const showDelay = 500
const hideDelay = 0

export const Tooltip = ({ children, content }) => {
  const { interfaceType } = useApp()
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [focused, setFocused] = useState(false)
  const [position, setPosition] = useState(null)
  const [tooltipId] = useState(() => {
    tooltipIdCounter += 1
    return `tooltip-${tooltipIdCounter}`
  })

  const showTimeout = useRef(null)
  const hideTimeout = useRef(null)

  const cancel = () => {
    clearTimeout(showTimeout.current)
    setVisible(false)
  }

  const show = () => {
    clearTimeout(hideTimeout.current)
    showTimeout.current = setTimeout(() => setVisible(true), showDelay)
  }

  const hide = () => {
    clearTimeout(showTimeout.current)
    hideTimeout.current = setTimeout(() => setVisible(false), hideDelay)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearTimeout(showTimeout.current)
        clearTimeout(hideTimeout.current)
        setVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    if (visible) {
      const pos = getTooltipPosition(triggerRef.current)
      setPosition(pos)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(showTimeout.current)
      clearTimeout(hideTimeout.current)
    }
  }, [visible])

  const childWithProps = cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: show,
    onMouseLeave: hide,
    onMouseDown: cancel,
    onKeyDown: cancel,
    onFocus: (e) => {
      if (interfaceType === 'keyboard') {
        show()
      }
      setFocused(true)
    },
    onBlur: (e) => {
      hide()
      setFocused(false)
    },
    'aria-labelledby': tooltipId
  })

  return (
    <div className={`am-c-tooltip-wrapper${focused ? ' am-c-tooltip-wrapper--has-focus' : ''}`}>
      {childWithProps}
      <div
        id={tooltipId}
        ref={tooltipRef}
        className={`am-c-tooltip am-c-tooltip--${position || 'hidden'} ${visible ? 'am-c-tooltip--is-visible' : ''}`}
        role='tooltip'
        aria-hidden={!visible}
      >
        {content}
      </div>
    </div>
  )
}
