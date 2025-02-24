import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'

export default function SearchButton ({ searchBtnRef, tooltip }) {
  const { dispatch, mode, search, activePanel, options } = useApp()
  const isQueryMode = ['frame', 'draw'].includes(mode)

  if (!(search && !isQueryMode)) {
    return null
  }

  const handleClick = () => {
    dispatch({ type: 'OPEN', payload: 'SEARCH' })
  }

  const button = () => {
    return (
      <button onClick={handleClick} className='fm-c-btn fm-c-btn--search' {...tooltip ? { 'aria-labelledby': `${options.id}-search-label` } : {}} aria-expanded={activePanel === 'SEARCH'} {...activePanel === 'SEARCH' ? { style: { display: 'none' } } : {}} ref={searchBtnRef}>
        <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
          <path d='M12.084 14.312c-1.117.711-2.444 1.123-3.866 1.123C4.235 15.435 1 12.201 1 8.218S4.235 1 8.218 1s7.217 3.235 7.217 7.218c0 1.422-.412 2.749-1.123 3.866L19 16.773 16.773 19l-4.689-4.688zM8.218 2.818c2.98 0 5.4 2.419 5.4 5.4s-2.42 5.4-5.4 5.4-5.4-2.42-5.4-5.4 2.419-5.4 5.4-5.4z' />
        </svg>
        {!tooltip && (
          <span className='fm-c-btn__label'>Search</span>
        )}
      </button>
    )
  }

  return (
    <>
      {tooltip
        ? (
          <Tooltip id={`${options.id}-search-label`} position={tooltip} cssModifier='search' text='Show search'>
            {button()}
          </Tooltip>
          )
        : button()}
    </>
  )
}
