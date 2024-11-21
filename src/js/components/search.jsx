import React, { useRef, useEffect, useReducer } from 'react'
import { useOutsideInteract } from '../hooks/use-outside-interact'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { reducer, initialState } from '../store/search-reducer'
import Autocomplete from './autocomplete.jsx'
import OsProvider from '../provider/os-open-names/provider.js'
import EsriProvider from '../provider/esri-world-geocoder/provider.js'

const getDerivedProps = (search, geocodeProvider, requestCallback, isMobile, isDesktop, legend, state) => {
  const geocode = geocodeProvider === 'esri-world-geocoder' ? new EsriProvider(requestCallback) : new OsProvider(requestCallback)
  const searchWidth = !isMobile ? (legend.keyWidth || legend.width) : null
  const isFixed = search.isExpanded && isDesktop
  const hasClear = isMobile && !!state.value?.length
  const hasClose = !isMobile && !isFixed
  const className = `fm-c-search${isFixed ? ' fm-c-search--fixed' : ''}`
  const formClassName = `fm-c-search__form${state.isFocusWithin ? ' fm-u-focus-within' : ''}${state.isFocusVisibleWithin ? ' fm-u-focus-visible-within' : ''}`
  return { geocode, searchWidth, isFixed, hasClear, hasClose, className, formClassName }
}

export default function Search ({ instigatorRef }) {
  const { isKeyboard, isMobile, isDesktop, options, search, activeRef, activePanel, activePanelHasFocus, legend } = useApp()
  const appDispatch = useApp().dispatch
  const viewportDispatch = useViewport().dispatch
  const { label, isAutocomplete } = search
  const { id, requestCallback, geocodeProvider } = options
  const [state, dispatch] = useReducer(reducer, initialState)
  const formRef = useRef()
  const clearBtnRef = useRef()
  const inputRef = useRef()

  const { geocode, searchWidth, isFixed, hasClear, hasClose, className, formClassName } = getDerivedProps(search, geocodeProvider, requestCallback, isMobile, isDesktop, legend, state)
  // Hide soft keyboard on touchstart outside search input
  useOutsideInteract(inputRef, 'touchstart', e => {
    if (document.activeElement !== inputRef.current) {
      return
    }
    inputRef.current.blur()
    if (!formRef.current?.contains(e.target)) {
      return
    }
    setTimeout(() => inputRef.current.focus(), 0)
  })

  const updateViewport = async (value, suggestionId) => {
    const location = await geocode.find(value, suggestionId)
    if (!location) {
      return
    }
    const { bbox, centre, zoom, text } = location
    viewportDispatch({ type: 'SEARCH', payload: { bbox, centre, zoom, place: text } })
  }

  const handleFocus = () => {
    // Hide all panels input has existing content
    if (isFixed && state.value?.length >= 1) {
      appDispatch({ type: 'CLOSE', payload: true })
    }
    dispatch({ type: 'FOCUS', payload: isKeyboard })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const suggestion = state.selected >= 0 ? state.suggestions[state.selected] : null
    const value = suggestion?.text || state.value
    dispatch({ type: 'SUBMIT', payload: value })
    updateViewport(value, suggestion?.id)
  }

  const handleCollapse = () => {
    appDispatch({ type: 'CLOSE' })
    activeRef.current = instigatorRef.current
  }

  const handleClear = () => {
    dispatch({ type: 'CLEAR', payload: { activeRef: inputRef, isFocusVisibleWithin: isKeyboard } })
    inputRef.current.focus()
  }

  const handleKeyDown = e => {
    // Escape key
    if (['Escape', 'Esc'].includes(e.key)) {
      e.preventDefault()
      if (state.value || state.isVisible) {
        dispatch({ type: 'HIDE_SUGGESTIONS' })
      } else {
        dispatch({ type: 'COLLAPSE', payload: instigatorRef })
      }
    }
    // Review suggestions
    if (['ArrowDown', 'ArrowUp'].includes(e.key) && state.suggestions.length >= 1) {
      e.preventDefault()
      dispatch({ type: 'REVIEW', payload: e.key })
    }
  }

  const handleKeyUp = e => {
    if (['Escape', 'Esc'].includes(e.key)) {
      e.preventDefault()
      handleCollapse()
    }
  }

  const handleChange = e => {
    // Hide all panels if alphanumeric key and search fixed
    if (isFixed) {
      appDispatch({ type: 'CLOSE', payload: true })
    }
    dispatch({ type: 'CHANGE', payload: e.target.value })
  }

  const handleClick = () => {
    dispatch({ type: 'CLICK', payload: { isKeyboard, activeRef: inputRef } })
  }

  // Move focus to input
  useEffect(() => {
    if (isFixed || !instigatorRef || !activePanelHasFocus) {
      return
    }
    activeRef.current = inputRef.current
  }, [activePanel])

  return (
    <div
      id={`${id}-search-form`} className={className}
      {...(!isFixed && {
        role: 'dialog',
        'aria-labelledby': `${id}-search`,
        'aria-modal': true,
        open: true,
        onKeyUp: handleKeyUp
      })}
      {...searchWidth && {
        style: { width: searchWidth }
      }}
      onKeyDown={handleKeyDown}
      ref={formRef}
    >
      <div className='fm-c-search__control'>
        <form role='search' className={formClassName} aria-controls={`${id}-viewport`} onSubmit={handleSubmit}>
          {isMobile && (
            <button onClick={handleCollapse} type='button' className='fm-c-btn fm-c-btn--search-back govuk-body-s' aria-label='Close search'>
              <svg aria-hidden='true' focusable='false' width='14' height='20' viewBox='0 0 14 20' fillRule='evenodd' fill='currentColor'>
                <path d='M3.828 10l8.486 8.485-1.415 1.414L1 10 10.899.101l1.415 1.414L3.828 10z' strokeWidth='0' />
              </svg>
            </button>
          )}
          <label htmlFor={`${id}-search`} className='fm-u-visually-hidden'>{label}</label>
          <input
            id={`${id}-search`}
            className='fm-c-search__input govuk-body-s'
            role='combobox'
            aria-expanded={state.isVisible}
            aria-controls={`${id}-suggestions`}
            type='search'
            {...(!state.value && { 'aria-describedby': `${id}-search-hint` })}
            aria-autocomplete='list'
            autoComplete='off'
            placeholder={label}
            name={`${id}-search`}
            spellCheck='false'
            enterKeyHint='search'
            {...(state.selected >= 0 && { 'aria-activedescendant': `${id}-search-suggestion-${state.selected}` })}
            value={state.value}
            onClick={handleClick}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={() => dispatch({ type: 'BLUR' })} ref={inputRef}
          />
          <div id={`${id}-search-hint`} style={{ display: 'none' }}>
            When search results are available use up and down arrows to review and enter to select.  Touch device users, explore by touch or with swipe gestures.
          </div>
          {hasClear && (
            <button className='fm-c-search__clear' aria-label='Clear search' type='button' onClick={handleClear} ref={clearBtnRef}>
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fill='currentColor'><path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' style={{ fill: 'currentColor', strokeWidth: '0' }} /></svg>
            </button>
          )}
          {hasClose && (
            <button onClick={handleCollapse} type='button' className='fm-c-btn fm-c-btn--search-close govuk-body-s' aria-label='Close search'>
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fill='currentColor'><path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' style={{ fill: 'currentColor', strokeWidth: '0' }} /></svg>
            </button>
          )}
          {isFixed && (
            <button className='fm-c-btn fm-c-btn--search govuk-body-s' aria-label='Search'>
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
                <path d='M12.084 14.312c-1.117.711-2.444 1.123-3.866 1.123C4.235 15.435 1 12.201 1 8.218S4.235 1 8.218 1s7.217 3.235 7.217 7.218c0 1.422-.412 2.749-1.123 3.866L19 16.773 16.773 19l-4.689-4.688zM8.218 2.818c2.98 0 5.4 2.419 5.4 5.4s-2.42 5.4-5.4 5.4-5.4-2.42-5.4-5.4 2.419-5.4 5.4-5.4z' />
              </svg>
            </button>
          )}
        </form>
      </div>
      {isAutocomplete && (
        <Autocomplete id={id} state={state} dispatch={dispatch} geocode={geocode} updateViewport={updateViewport} />
      )}
    </div>
  )
}
