import React, { useRef, useEffect, useMemo } from 'react'
import { debounce } from '../lib/debounce'
import Status from './status.jsx'

export default function Autocomplete ({ id, state, dispatch, provider, updateViewport }) {
  const SUGGEST_DELAY = 350
  const STATUS_DELAY = 500
  const selectedRef = useRef()

  const { value, selected } = state

  const debounceUpdateSuggest = debounce(async (text) => {
    const items = await provider.suggest(text)
    dispatch({ type: 'ADD_SUGGESTIONS', payload: items })
    updateStatus()
  }, SUGGEST_DELAY)

  const debounceUpdateStatus = debounce(() => {
    dispatch({ type: 'UPDATE_STATUS' })
  }, STATUS_DELAY)

  const updateStatus = () => {
    dispatch({ type: 'CLEAR_STATUS' })
    debounceUpdateStatus()
  }

  const handleOnMouseDown = (e, i) => {
    e.preventDefault()
    const text = state.suggestions[i].text
    const suggestionId = state.suggestions[i].id
    dispatch({ type: 'SUBMIT', payload: text })
    updateViewport(text, suggestionId)
  }

  useEffect(() => {
    updateStatus()
  }, [state.isVisible])

  useEffect(() => {
    updateStatus()
    setTimeout(() => selectedRef.current?.scrollIntoView(false), 0)
  }, [selected])

  useEffect(() => {
    const MIN_LENGTH = 3
    if (value.length >= MIN_LENGTH) {
      debounceUpdateSuggest(value)
      return
    }
    updateStatus()
  }, [value])

  return (
    <div className='fm-c-search__suggestions'>
      {useMemo(() => {
        return (
          <Status isVisuallyHidden message={state.status} cache={(new Date()).getTime()} />
        )
      }, [state.status])}
      <ul id={`${id}-suggestions`} role='listbox' aria-labelledby={`${id}-search`} className='fm-c-search__list' {...(!state.isVisible ? { style: { display: 'none' } } : {})} onMouseEnter={() => dispatch({ type: 'MOUSEENTER' })}>
        {state.suggestions.map((item, i) =>
          <li key={item.id} ref={state.selected === i ? selectedRef : null} className={`fm-c-search-item${state.selected === i ? ' fm-c-search-item--selected' : ''} govuk-body-s`} onMouseDown={e => handleOnMouseDown(e, i)} role='option' aria-selected={state.selected === i} aria-posinset={i + 1} aria-setsize={state.suggestions.length} tabIndex='-1'>
            <span className='fm-c-search-item__primary' dangerouslySetInnerHTML={item.marked} />
          </li>)}
      </ul>
    </div>
  )
}
