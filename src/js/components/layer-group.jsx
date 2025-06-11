import React, { useState, useEffect, Fragment } from 'react'
import { useQueryState } from '../hooks/use-query-state'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { events } from '../store/constants'
import eventBus from '../lib/eventbus.js'
import { parseSVG } from '../lib/symbols'
import { getColor } from '../lib/utils.js'

const getDerivedProps = (group, layers, hasInputs) => {
  const ROW_WIDTH = 300
  const layout = hasInputs ? group.layout : 'column'
  const isDetails = hasInputs && layout !== 'column' && group.heading && ['expanded', 'collapse'].includes(group.collapse)
  const numItems = group.items.length
  const numCols = layout === 'column' && group.display === 'ramp' ? numItems : Math.min(numItems, 4)
  const heading = group.heading || group.label
  const checkedRadioId = group.items.find(item => layers?.includes(item.id))?.id
  const styleAttr = { ...layout === 'column' ? { style: { gridTemplateColumns: numItems >= 4 ? `repeat(auto-fit, minmax(${Math.round(ROW_WIDTH / numCols)}px, auto))` : 'repeat(3, 1fr)' } } : {} }
  return { layout, isDetails, heading, checkedRadioId, styleAttr }
}

const getLabels = (group, item, checkedRadioId, layers) => {
  const isActive = group?.type === 'radio' ? item.id === checkedRadioId : layers?.includes(item.id)
  return isActive ? [item.label] : []
}

const getDisplay = (group, item) => {
  return group.display || (item.icon && 'icon') || (item.fill && 'fill') || item.display
}

export default function LayerGroup ({ id, group, legendDisplay, hasSymbols, hasInputs }) {
  const { parent, dispatch, drawMode, layers, segments } = useApp()
  const { size, style } = useViewport()
  const viewportDispatch = useViewport().dispatch
  const [, setQueryLyr] = useQueryState('lyr')
  const [isExpanded, setIsExpanded] = useState(group?.collapse !== 'collapse')
  const [svg, setSvg] = useState({})

  const dispatchAppChange = lyr => {
    dispatch({ type: 'TOGGLE_LAYERS', payload: lyr })
    viewportDispatch({ type: 'CLEAR_FEATURES' })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'layer', drawMode, style, size, segments, layers: lyr })
    // Update query param
    setQueryLyr(lyr.join(','))
  }

  const handleButtonClick = (e) => {
    const lyr = layers
    const index = lyr.indexOf(e.currentTarget.value)
    const isPressed = e.currentTarget.getAttribute('aria-pressed')
    isPressed === 'true' ? lyr.splice(index, 1) : lyr.push(e.currentTarget.value)
    dispatchAppChange(lyr)
  }

  const handleCheckboxChange = (e) => {
    const lyr = layers
    const index = lyr.indexOf(e.target.value)
    e.target.checked ? lyr.push(e.target.value) : lyr.splice(index, 1)
    dispatchAppChange(lyr)
  }

  const handleRadioChange = e => {
    const lyr = layers
    if (checkedRadioId) {
      lyr.splice(lyr.indexOf(checkedRadioId), 1)
    }
    lyr.push(e.currentTarget.value)
    dispatchAppChange(lyr)
  }

  const handleDetailsClick = () => {
    setIsExpanded(!isExpanded)
  }

  // Display properties
  const { layout, isDetails, heading, checkedRadioId, styleAttr } = getDerivedProps(group, layers, hasInputs)
  const groupSummary = group.items.reduce((result, current) => [...result, ...getLabels(group, current, checkedRadioId, layers)], []).join(', ').replace(/, ([^,]*)$/, ', $1')
  const isDarkBasemap = ['dark', 'aerial'].includes(style.name)

  const keySymbol = ({ item, display }) => {
    const fill = getColor(item?.fill, style.name)

    return (
      <>
        {display === 'icon' && (
          <div className={`fm-c-layers__image fm-c-layers__image--${display}`} dangerouslySetInnerHTML={svg[item.icon]} />
        )}
        {display === 'fill' && (
          <div className={`fm-c-layers__image fm-c-layers__image--${display}`}>
            <svg width='40' height='40' viewBox='0 0 40 40' fill={fill}>
              <path d='M8 8h24v24H8z' />
            </svg>
          </div>
        )}
        {display === 'query-polygon' && (
          <div className={`fm-c-layers__image fm-c-layers__image--${display}`}>
            <svg width='40' height='40' viewBox='0 0 40 40' fill='none'>
              <path d='M9 9h22v22H9z' />
            </svg>
          </div>
        )}
        {display === 'ramp' && (
          <div className={`fm-c-layers__image fm-c-layers__image--${display}`}>
            <svg viewBox='0 0 5 5' preserveAspectRatio='none' fill={fill} stroke={fill} strokeWidth={1}>
              <path d='M0 0h5v5H0z' />
            </svg>
          </div>
        )}
      </>
    )
  }

  const itemInner = ({ item, index, display, isChecked }) => {
    if (hasInputs && group.type === 'radio') {
      return (
        // Radio
        <>
          <input className='fm-c-layers__radio' defaultChecked={isChecked} id={item.id} name={`group-${id}`} type='radio' value={item.id} onChange={handleRadioChange} />
          <label className='fm-c-layers__label' htmlFor={item.id}>
            {hasSymbols && keySymbol({ display, item })}
            <span className='fm-c-layers__text' dangerouslySetInnerHTML={{ __html: item.label }} />
          </label>
        </>
      )
    } else if (hasInputs && item.id && legendDisplay === 'inset') {
      return (
        // Toggle button
        <button className='fm-c-layers__button' aria-pressed={isChecked} value={item.id} onClick={handleButtonClick}>
          {hasSymbols && keySymbol({ display, item })}
          <span className='fm-c-layers__text' dangerouslySetInnerHTML={{ __html: item.label }} />
        </button>
      )
    } else if (hasInputs && item.id) {
      return (
        // Checkbox
        <>
          <input className='fm-c-layers__checkbox' defaultChecked={isChecked} id={item.id} name={`group-${id}`} type='checkbox' value={item.id} onChange={handleCheckboxChange} />
          <label className='fm-c-layers__label' htmlFor={item.id}>
            {hasSymbols && keySymbol({ display, item })}
            <span className='fm-c-layers__text' dangerouslySetInnerHTML={{ __html: item.label }} />
          </label>
        </>
      )
    } else {
      return (
        // Symbol only
        <>
          {hasSymbols && keySymbol({ display, item })}
          <span className={group.numLabels && index % group.numLabels !== 0 ? 'fm-u-visually-hidden' : 'fm-c-layers__text'} dangerouslySetInnerHTML={{ __html: item.label }} />
        </>
      )
    }
  }

  useEffect(() => {
    // Cross browser flatten array
    let items = group.items.map(item => item.items || item)
    items = [].concat(...items).filter(item => item.icon)
    Promise.all(items.map(item => fetch(item.icon))).then(responses =>
      Promise.all(responses.map(res => res.text()))
    ).then(texts => {
      const icons = {}
      texts.forEach((text, i) => {
        const item = items[i]
        const fill = getColor(item?.fill, style.name)
        icons[item.icon] = { __html: parseSVG(item.icon, fill, text, isDarkBasemap) }
      })
      setSvg(icons)
    })
  }, [group])

  return (
    <div className={`fm-c-layers__group${isDetails && !isExpanded ? ' fm-c-layers__group--hidden' : ''} fm-c-layers__group--${layout || 'row'}${group.numLabels ? ' fm-c-layers__group--custom-labels' : ''}`} role='group' aria-label={heading}>
      {isDetails
        ? (
          <h3 className='fm-c-layers__heading fm-c-layers__heading--details'>
            <button className='fm-c-details' aria-expanded={isExpanded} aria-controls={`content-${id}`} onClick={handleDetailsClick}>
              <span className='fm-c-details__label'>
                <span className='fm-c-details__label-focus'>{heading}</span>
              </span>
              <span className='fm-c-details__summary'>
                <span className='fm-c-details__summary-focus'>{groupSummary || 'None selected'}</span>
              </span>
              <span className='fm-c-details__toggle'>
                <span className='fm-c-details__toggle-focus'>
                  <span className='fm-c-details__chevron' />
                  {isExpanded ? 'Hide' : 'Show'}
                </span>
              </span>
            </button>
          </h3>
          )
        : heading && (
          <h3 className='fm-c-layers__heading' aria-hidden='true'>{heading}</h3>
        )}
      <div
        id={`content-${id}`}
        className={`fm-c-layers__${layout || 'row'}s`}
        {...styleAttr}
      >
        {group.items.map((item, i) => {
          let display = getDisplay(group, item)
          const isChecked = group?.type === 'radio' ? item?.id === checkedRadioId : layers?.includes(item.id)
          return (
            <Fragment key={(item.id || item.label).toLowerCase()}>
              {(hasSymbols || item.id) && (
                <div className={`fm-c-layers__item fm-c-layers__item--${display}`}>
                  {itemInner({ item, index: i, display, isChecked })}
                </div>
              )}
              {hasSymbols && item.items?.map((child, j) => {
                display = item.display || (child.icon ? 'icon' : 'fill')
                return (
                  <div key={`${item.label.toLowerCase()}-${j}`} className={`fm-c-layers__item fm-c-layers__item--${display}`}>
                    {itemInner({ item: child, index: j, display })}
                  </div>
                )
              })}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
