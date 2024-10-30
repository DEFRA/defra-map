import React, { useRef, useEffect, useMemo } from 'react'
import { debounce } from '../lib/debounce'
import Status from './status.jsx'

export default function Autocomplete ({ id, state, dispatch, provider, updateViewport }) {
  const selectedRef = useRef()

  const { value, selected } = state

  const debounceUpdateSuggest = debounce(async (value) => {
    const items = await provider.suggest(value)
    dispatch({ type: 'ADD_SUGGESTIONS', suggestions: items })
    updateStatus()
  }, 350)

  const debounceUpdateStatus = debounce(() => {
    dispatch({ type: 'UPDATE_STATUS' })
  }, 500)

  const updateStatus = () => {
    dispatch({ type: 'CLEAR_STATUS' })
    debounceUpdateStatus()
  }

  const handleOnMouseDown = (e, i) => {
    e.preventDefault()
    const value = state.suggestions[i].text
    const id = state.suggestions[i].id
    dispatch({ type: 'SUBMIT', value })
    updateViewport(value, id)
  }

  useEffect(() => {
    updateStatus()
  }, [state.isVisible])

  useEffect(() => {
    updateStatus()
    setTimeout(() => selectedRef.current?.scrollIntoView(false), 0)
  }, [selected])

  useEffect(() => {
    value.length >= 3 ? debounceUpdateSuggest(value) : updateStatus()
  }, [value])

  return (
    <div className='fm-c-search__suggestions' {...(!state.isVisible ? { style: { display: 'none' } } : {})} onMouseEnter={() => dispatch({ type: 'MOUSEENTER' })}>
      {useMemo(() => {
        return (
          <Status isVisuallyHidden message={state.status} cache={(new Date()).getTime()} />
        )
      }, [state.status])}
      <ul id={`${id}-suggestions`} role='listbox' aria-labelledby={`${id}-search`} className='fm-c-search__list'>
        {state.suggestions.map((item, i) =>
          <li key={item.id} ref={state.selected === i ? selectedRef : null} className={`fm-c-search-item${state.selected === i ? ' fm-c-search-item--selected' : ''} govuk-body-s`} onMouseDown={e => handleOnMouseDown(e, i)} role='option' aria-selected={state.selected === i} aria-posinset={i + 1} aria-setsize={state.suggestions.length} tabIndex='-1'>
            <span className='fm-c-search-item__primary' dangerouslySetInnerHTML={item.marked} />
          </li>)}
      </ul>
    </div>
  )
}
