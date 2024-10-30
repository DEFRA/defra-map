import React, { useState, Fragment } from 'react'
import { useQueryState } from '../hooks/use-query-state'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { events } from '../store/constants'
import eventBus from '../lib/eventbus.js'
import Symbol from './symbol.jsx'

export default function LayerGroup ({ id, group, hasSymbols, hasInputs }) {
  const { parent, dispatch, mode, layers, segments, query } = useApp()
  const { basemap, size } = useViewport()
  const [, setQueryLyr] = useQueryState('lyr')
  const [isExpanded, setIsExpanded] = useState(group?.collapse !== 'collapse')

  const handleItemClick = e => {
    const lyr = layers
    const index = lyr.indexOf(e.currentTarget.value)
    e.currentTarget.getAttribute('aria-checked') === 'false' ? lyr.push(e.currentTarget.value) : lyr.splice(index, 1)
    dispatchAppChange(lyr)
  }

  const handleItemChange = e => {
    const lyr = layers
    if (checkedRadioId) {
      lyr.splice(lyr.indexOf(checkedRadioId), 1)
    }
    lyr.push(e.currentTarget.value)
    dispatchAppChange(lyr)
  }

  const dispatchAppChange = lyr => {
    dispatch({ type: 'TOGGLE_LAYERS', layers: lyr })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'layer', mode, basemap, size, segments, layers: lyr })
    // Update query param
    setQueryLyr(lyr.join(','))
  }

  const handleDetailsClick = e => {
    setIsExpanded(!isExpanded)
  }

  // Display properties
  const layout = hasInputs ? group.layout : 'column'
  const isDetails = hasInputs && layout !== 'column' && group.heading && ['expanded', 'collapse'].includes(group.collapse)
  const numItems = group.items.length
  const numCols = layout === 'column' && group.display === 'ramp' ? numItems : Math.min(numItems, 4)
  const groupHeading = group.heading || group.label
  const checkedRadioId = group.items.find(item => layers?.includes(item.id))?.id
  const style = { ...layout === 'column' ? { style: { gridTemplateColumns: numItems >= 4 ? `repeat(auto-fit, minmax(${Math.round(300 / numCols)}px, auto))` : 'repeat(3, 1fr)' } } : {} }
  const groupSummary = group.items.reduce((result, { label, id }) => [...result, ...(group?.type === 'radio' ? id === checkedRadioId : layers?.includes(id)) ? [label] : []], [])
    .join(', ').replace(/, ([^,]*)$/, ', $1') || 'None selected'

  return (
    <div className={`fm-c-layers__group fm-c-layers__group--${layout || 'row'}${group.numLabels ? ' fm-c-layers__group--custom-labels' : ''}`} role='group' aria-label={groupHeading}>
      {isDetails
        ? (
          <button className='fm-c-details govuk-body-s' aria-expanded={isExpanded} aria-controls={`content-${id}`} onClick={handleDetailsClick}>
            <span className='fm-c-details__label'>
              <span className='fm-c-details__label-focus'>{groupHeading}</span>
            </span>
            <span className='fm-c-details__summary'>
              <span className='fm-c-details__summary-focus'>{groupSummary}</span>
            </span>
            <span className='fm-c-details__toggle'>
              <span className='fm-c-details__toggle-focus'>
                <span className='fm-c-details__chevron' />
                {isExpanded ? 'Hide' : 'Show'}
              </span>
            </span>
          </button>
          )
        : groupHeading
          ? <h3 className='fm-c-layers__heading govuk-body-s' aria-hidden='true'>{groupHeading}</h3>
          : null}
      <div
        id={`content-${id}`}
        className={`fm-c-layers__${layout || 'row'}s`}
        {...style}
      >
        {group.items.map((item, i) => {
          const display = group.display || (item.icon ? 'icon' : item.fill ? 'fill' : item.display)
          const isChecked = group?.type === 'radio' ? item?.id === checkedRadioId : layers?.includes(item.id)
          return (
            <Fragment key={(item.id || item.label).toLowerCase()}>
              {(hasSymbols || item.id) ? (
              <div className={`fm-c-layers__item fm-c-layers__item--${display} govuk-body-s`}>
                {hasInputs && group.type === 'radio'
                  ? (
                    <>
                      <input className='fm-c-layers__radio' defaultChecked={isChecked} id={item.id} name={`group-${id}`} type='radio' value={item.id} onChange={handleItemChange} />
                      <label className='fm-c-layers__label' htmlFor={item.id}>
                        {hasSymbols ? <Symbol display={display} item={item} /> : null}
                        <span className='fm-c-layers__text' dangerouslySetInnerHTML={{ __html: item.label }} />
                      </label>
                    </>
                    )
                  : hasInputs && item.id
                    ? (
                      <button className='fm-c-layers__button' role='switch' aria-checked={isChecked} value={item.id} onClick={handleItemClick}>
                        {hasSymbols ? <Symbol display={display} item={item} /> : null}
                        <span className='fm-c-layers__text' dangerouslySetInnerHTML={{ __html: item.label }} />
                      </button>
                      )
                    : (
                      <>
                        {hasSymbols ? <Symbol display={display} item={item} /> : null}
                        <span className={group.numLabels && i % group.numLabels !== 0 ? 'fm-u-visually-hidden' : 'fm-c-layers__text'} dangerouslySetInnerHTML={{ __html: item.label }} />
                      </>
                      )}
              </div>
              ) : null}
              {hasSymbols
                ? item.items?.map((child, j) => {
                  const display = item.display || (child.icon ? 'icon' : 'fill')
                  return (
                    <div key={`${item.label.toLowerCase()}-${j}`} className={`fm-c-layers__item fm-c-layers__item--${display} govuk-body-s`}>
                      <Symbol display={display} item={child} />
                      <span className='fm-c-layers__text' dangerouslySetInnerHTML={{ __html: child.label }} />
                    </div>
                  )
                })
                : null}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
