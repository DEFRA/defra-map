import React, { useRef, useEffect, useReducer } from 'react'
import { useOutsideInteract } from '../hooks/use-outside-interact'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { reducer, initialState } from '../store/search-reducer'
import Autocomplete from './autocomplete.jsx'
import OsProvider from '../provider/os-open-names/provider.js'

const getDerivedProps = (search, transformSearchRequest, isMobile, legend, state) => {
  const geocode = new OsProvider(transformSearchRequest)
  const searchWidth = !isMobile ? (legend.keyWidth || legend.width) : null
  const hasClear = isMobile && !!state.value?.length
  const className = 'fm-c-search'
  const formClassName = `fm-c-search__form${state.isFocusWithin ? ' fm-u-focus-within' : ''}${state.isFocusVisibleWithin ? ' fm-u-focus-visible-within' : ''}`
  const label = `Search for a place${search.country ? ' in ' + search.country.charAt(0).toUpperCase() + search.country.slice(1) : ''}`
  return { geocode, searchWidth, hasClear, className, formClassName, label }
}

const hasPanel = (search, activePanel, isDesktop) => {
  return activePanel === 'SEARCH' || (isDesktop && search?.isExpanded)
}

export default function Search ({ instigatorRef }) {
  const { interfaceType, isMobile, options, search, activeRef, activePanel, isDesktop, legend } = useApp()
  const appDispatch = useApp().dispatch
  const viewportDispatch = useViewport().dispatch
  const { isAutocomplete } = search
  const { id, transformSearchRequest } = options
  const [state, dispatch] = useReducer(reducer, initialState)
  const formRef = useRef()
  const clearBtnRef = useRef()
  const inputRef = useRef()
  const { geocode, searchWidth, hasClear, className, formClassName, label } = getDerivedProps(search, transformSearchRequest, isMobile, legend, state)

  // Hide search on click outside
  useOutsideInteract(formRef, false, 'pointerdown', e => {
    if (e.target === instigatorRef.current || formRef.current?.contains(e.target)) {
      return
    }
    handleCollapse()
  })

  // Hide soft keyboard on touchstart outside search input
  useOutsideInteract(inputRef, true, 'touchstart', e => {
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
    const { bounds, center, zoom, text } = location
    viewportDispatch({ type: 'SEARCH', payload: { bounds, center, zoom, place: text } })
  }

  const handleFocus = () => {
    dispatch({ type: 'FOCUS', payload: interfaceType === 'keyboard' })
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
    dispatch({ type: 'CLEAR', payload: { activeRef: inputRef, isFocusVisibleWithin: interfaceType === 'keyboard' } })
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
    if (['ArrowDown', 'ArrowUp'].includes(e.key) && state.suggestions?.length >= 1) {
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
    dispatch({ type: 'CHANGE', payload: e.target.value })
  }

  const handleClick = () => {
    const isKeyboard = interfaceType === 'keyboard'
    dispatch({ type: 'CLICK', payload: { isKeyboard, activeRef: inputRef } })
  }

  // Move focus to input
  useEffect(() => {
    if (activePanel === 'SEARCH') {
      activeRef.current = inputRef.current
    }
  }, [activePanel])

  if (!hasPanel(search, activePanel, isDesktop)) {
    return null
  }

  return (
    <div
      id={`${id}-search-form`} className={className}
      role='dialog'
      aria-labelledby={`${id}-search`}
      aria-modal
      open
      onKeyUp={handleKeyUp}
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
          {hasClear && (
            <button className='fm-c-search__clear' aria-label='Clear search' type='button' onClick={handleClear} ref={clearBtnRef}>
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fill='currentColor'><path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' style={{ fill: 'currentColor', strokeWidth: '0' }} /></svg>
            </button>
          )}
          {!isMobile && (
            <button onClick={handleCollapse} type='button' className='fm-c-btn fm-c-btn--search-close govuk-body-s' aria-label='Close search'>
              <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fill='currentColor'><path d='M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z' style={{ fill: 'currentColor', strokeWidth: '0' }} /></svg>
            </button>
          )}
        </form>
      </div>
      <div id={`${id}-search-hint`} style={{ display: 'none' }}>
        When search results are available use up and down arrows to review and enter to select.  Touch device users, explore by touch or with swipe gestures.
      </div>
      {isAutocomplete && (
        <Autocomplete id={id} state={state} dispatch={dispatch} geocode={geocode} errorText={search.errorText} updateViewport={updateViewport} />
      )}
    </div>
  )
}
