import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../store/use-app'

export default function Tooltip ({ id, position, text, cssModifier, children }) {
  const { interfaceType } = useApp()
  const [isVisible, setIsVisible] = useState(false)
  const [hasFocusWithin, setHasFocusWithin] = useState(false)

  const timeoutRef = useRef(null)
  const labelRef = useRef(null)

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const DELAY = 500

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), DELAY)
  }

  const handleKeyDown = () => {
    setHasFocusWithin(false)
  }

  const handleKeyUp = () => {
    setHasFocusWithin(true)
  }

  const handleGlobalKeyDown = e => {
    const isActive = labelRef.current?.contains(document.activeElement)
    if (['Escape', 'Esc'].includes(e.key) || isActive) {
      hideTooltip()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown)

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  })

  return (
    <div
      className={`fm-c-tooltip fm-c-tooltip--${position}${cssModifier ? ' fm-c-tooltip--' + cssModifier : ''}${isVisible ? ' fm-c-tooltip--visible' : ''}${hasFocusWithin ? ' fm-u-focus-within' : ''}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onMouseDown={hideTooltip}
      onFocus={interfaceType === 'keyboard' ? showTooltip : null}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      ref={labelRef}
    >
      {children}
      <div id={id} className='fm-c-tooltip__label' role='tooltip'>
        <div className='fm-c-tooltip__label-inner'>
          {text}
        </div>
      </div>
    </div>
  )
}
