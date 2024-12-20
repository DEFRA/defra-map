import React, { useRef } from 'react'
import { useApp } from '../store/use-app'
import { findTabStop } from '../lib/dom.js'

export default function More ({ id, label, isExpanded, setIsExpanded, isRemove }) {
  const { activeRef } = useApp()
  const btnRef = useRef(null)

  const handleClick = () => {
    setIsExpanded()
    if (!isRemove) {
      return
    }
    const previousTabStop = findTabStop(document.activeElement, 'prev')
    activeRef.current = previousTabStop
  }

  return (
    <>
      {!(isRemove && isExpanded)
        ? (
          <button
            className='fm-c-btn-more'
            aria-controls={id}
            aria-label={label}
            aria-expanded={isExpanded}
            ref={btnRef}
            onClick={handleClick}
          >
            <span className='fm-c-btn-more__chevron' />
            {label}
          </button>
          )
        : null}
    </>
  )
}
