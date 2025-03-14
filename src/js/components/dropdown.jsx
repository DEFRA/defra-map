import React, { useState, useRef, useEffect } from 'react'
import { useOutsideInteract } from '../hooks/use-outside-interact'
import Tooltip from './tooltip.jsx'

export default function Dropdown ({ id, name, display, items, selected, handleSelect }) {
  const label = name.toLowerCase().replace(' ', '-')
  const [isExpanded, setIsExpanded] = useState(false)
  const [index, setIndex] = useState(0)
  const elementRef = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const instigatorRef = useRef(null)

  const handleButtonClick = () => {
    setIsExpanded(!isExpanded)
  }

  const handleButtonKeyUp = e => {
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault()
      setIndex(e.key === 'ArrowDown' ? 0 : items.length - 1)
      setIsExpanded(true)
    }
  }

  const handleMenuKeyDown = e => {
    if (['Escape', 'Esc'].includes(e.key)) {
      e.preventDefault()
      instigatorRef.current = buttonRef.current
      setIsExpanded(false)
    }
    if (e.key === 'Tab') {
      instigatorRef.current = null
      setIsExpanded(false)
    }
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault()
      let i = e.key === 'ArrowDown' ? index + 1 : index - 1
      if (i < 0) {
        i = items.length - 1
      }
      if (i >= items.length) {
        i = 0
      }
      setIndex(i)
    }
    if (e.key === 'Home') {
      setIndex(0)
    }
    if (e.key === 'End') {
      setIndex(items.length - 1)
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      instigatorRef.current = buttonRef.current
      setIsExpanded(false)
      handleSelect(items[index].name)
    }
  }

  const handleMenuBlur = () => {
    setIsExpanded(false)
  }

  const handleItemClick = (_, i) => {
    instigatorRef.current = buttonRef.current
    setIsExpanded(false)
    handleSelect(items[i].name)
  }

  useEffect(() => {
    if (isExpanded) {
      menuRef.current.focus()
    } else {
      instigatorRef.current?.focus()
    }
  }, [isExpanded])

  useOutsideInteract(elementRef, false, 'pointerdown', () => {
    setIsExpanded(false)
  })

  return (
    <div className='fm-c-dropdown' style={{ display }} ref={elementRef}>
      <Tooltip id={`${id}-${label}-tooltip`} position='below' cssModifier='frame' text='Change shape'>
        <button
          ref={buttonRef}
          id={`${id}-${label}-button-label`}
          onClick={handleButtonClick}
          onKeyUp={handleButtonKeyUp}
          className='fm-c-btn'
          aria-labelledby={`${id}-${label}-tooltip, ${id}-${label}-description`}
          aria-haspopup='true'
          aria-expanded={isExpanded}
          aria-controls={`${id}-${label}-menu`}
        >
          <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
            <path d={selected.path} />
          </svg>
          <span className='fm-c-btn__chevron' />
          <span id={`${id}-${label}-description`} className='fm-u-visually-hidden'>Current selection: {selected.name}</span>
        </button>
      </Tooltip>
      <ul ref={menuRef} id={`${id}-${label}-menu`} className='fm-c-dropdown__list' role='menu' tabIndex='-1' aria-labelledby={`${id}-${label}-button-label`} aria-activedescendant={`${id}-${label}-item-${index}`} onKeyDown={handleMenuKeyDown} onBlur={handleMenuBlur} style={{ display: isExpanded ? 'block' : 'none' }}>
        {items.map((item, i) => (
          <li key={item.name} id={`${id}-${label}-item-${i}`} className={`fm-c-dropdown__item${index === i ? ' fm-c-dropdown__item--selected' : ''}`} role='menuitem' onClick={e => handleItemClick(e, i)}>
            {item.path && (
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
                <path d={item.path} />
              </svg>
            )}
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
