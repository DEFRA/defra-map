import React, { useRef, useEffect, useMemo } from 'react'
import { debounce } from '../lib/debounce'
import { defaults } from '../store/constants'

export default function Autocomplete ({ id, state, dispatch, geocode, errorText, updateViewport }) {
  const SUGGEST_DELAY = 350
  const STATUS_DELAY = 500
  const selectedRef = useRef()

  const { value, selected } = state

  const debounceUpdateSuggest = debounce(async (text) => {
    const items = await geocode.suggest(text)
    dispatch({ type: 'SHOW_SUGGESTIONS', payload: items })
    updateStatus()
  }, SUGGEST_DELAY)

  const updateStatus = () => {
    dispatch({ type: 'CLEAR_STATUS' })
    debounceUpdateStatus()
  }

  const debounceUpdateStatus = debounce(() => {
    dispatch({ type: 'UPDATE_STATUS' })
  }, STATUS_DELAY)

  const handleClick = (e, i) => {
    console.log('autocomplete: click')
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
    if (value.length >= defaults.MIN_SEARCH_LENGTH) {
      debounceUpdateSuggest(value)
      return
    }
    updateStatus()
  }, [value])

  return (
    <div className='fm-c-search__suggestions'>
      {useMemo(() => {
        return (
          <div className='fm-u-visually-hidden' aria-live='assertive' aria-atomic>
            {state.status}
          </div>
        )
      }, [state.status])}
      {(state.value?.length >= defaults.MIN_SEARCH_LENGTH) && state.suggestions && !state.suggestions.length && (
        <div className='fm-c-search__hint'>{errorText || 'No results are available'}</div>
      )}
      <ul id={`${id}-suggestions`} role='listbox' aria-labelledby={`${id}-search`} className='fm-c-search__list' {...(!state.isVisible ? { style: { display: 'none' } } : {})} onMouseEnter={() => dispatch({ type: 'MOUSEENTER' })}>
        {state.suggestions?.map((item, i) =>
          <li key={item.id} ref={state.selected === i ? selectedRef : null} id={`${id}-search-suggestion-${i}`} className={`fm-c-search-item${state.selected === i ? ' fm-c-search-item--selected' : ''}`} onClick={e => handleClick(e, i)} role='option' aria-selected={state.selected === i} aria-posinset={i + 1} aria-setsize={state.suggestions.length} tabIndex='-1'>
            <span className='fm-c-search-item__primary' dangerouslySetInnerHTML={item.marked} />
          </li>)}
      </ul>
    </div>
  )
}
