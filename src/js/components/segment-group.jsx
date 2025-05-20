import React, { useState, Fragment } from 'react'
import { useQueryState } from '../hooks/use-query-state'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { events } from '../store/constants'
import eventBus from '../lib/eventbus.js'
import { parseSegments, parseLayers } from '../lib/query.js'

export default function SegmentGroup ({ id, group }) {
  const { parent, style, drawMode, segments, legend, dispatch } = useApp()
  const { size } = useViewport()
  const viewportDispatch = useViewport().dispatch
  const [, setQuerySeg] = useQueryState('seg')
  const { display, heading, isHidden, isDetails } = group
  const [isExpanded, setIsExpanded] = useState(group.isExpanded)

  const handleItemClickOrChange = e => {
    let seg = segments?.filter(s => !items.map(i => i.id).includes(s))
    seg.push(e.currentTarget.value)
    seg = parseSegments(legend?.segments, seg)
    const lyr = parseLayers(legend?.key)
    dispatch({ type: 'TOGGLE_SEGMENTS', payload: { segments: seg, layers: lyr } })
    viewportDispatch({ type: 'CLEAR_FEATURES' })
    eventBus.dispatch(parent, events.APP_CHANGE, { type: 'segment', drawMode, style, size, segments: seg, layers: lyr })

    // Update query param
    setQuerySeg(seg.join(','))
  }

  const handleDetailsClick = () => {
    setIsExpanded(!isExpanded)
  }

  const items = group.items.map(i => { return { ...i, isChecked: segments.includes(i.id) } })
  const selected = items.find(i => i.isChecked).label

  return (
    <div className={`fm-c-segments${display ? ' fm-c-segments--' + display : ''}${isDetails && !isExpanded ? ' fm-c-segments--hidden' : ''}`} {...isHidden ? { style: { display: 'none' } } : {}}>
      {isDetails
        ? (
          <h3 className='fm-c-segments__heading'>
            <button className='fm-c-details' aria-expanded={isExpanded} aria-controls={`content-${id}`} onClick={handleDetailsClick}>
              <span className='fm-c-details__label'>
                <span className='fm-c-details__label-focus'>{heading}</span>
              </span>
              <span className='fm-c-details__summary'>
                <span className='fm-c-details__summary-focus'>{selected}</span>
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
      <div id={`content-${id}`} className='fm-c-segments__inner' role='group' {...heading ? { 'aria-labelledby': `segment-${id}` } : { 'aria-label': 'Segments' }}>
        {items.map(item => (
          <Fragment key={item.label.toLowerCase()}>
            {['timeline', 'segmented'].includes(display)
              ? (
                <button aria-pressed={item.isChecked} className='fm-c-segments__button' value={item.id} onClick={handleItemClickOrChange}>
                  {!['timeline', 'segmented'].includes(display)
                    ? <span className='fm-c-segments__button-icon' />
                    : null}
                  <span className='fm-c-segments__button-text' dangerouslySetInnerHTML={{ __html: item.label }} />
                </button>
                )
              : (
                <div className='fm-c-segments__item'>
                  <input className='fm-c-segments__radio' defaultChecked={item.isChecked} id={item.id} name={`group-${id}`} type='radio' value={item.id} onChange={handleItemClickOrChange} />
                  <label className='fm-c-segments__label' htmlFor={item.id} dangerouslySetInnerHTML={{ __html: item.label }} />
                </div>
                )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
