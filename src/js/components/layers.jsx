import React, { useEffect, Fragment } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { findTabStop } from '../lib/dom.js'
import { parseGroups } from '../lib/query.js'
import More from './more.jsx'
import LayerGroup from './layer-group.jsx'

export default function Layers ({ hasSymbols, hasInputs }) {
  const { dispatch, query, segments, options, activeRef, layers, isKeyExpanded } = useApp()
  const { id, legend, queryPolygon } = options
  const { display, keyDisplay } = legend
  const { zoom } = useViewport()

  // Derived properties
  const moreLabel = keyDisplay === 'min' && isKeyExpanded ? 'Fewer layers' : 'All layers'
  const maxRow = display === 'inset' && keyDisplay === 'min' ? 0 : legend.key.length
  const queryLabel = query ? queryPolygon.keyLabel : null
  const groups = parseGroups(legend.key, segments, layers, zoom, hasInputs, queryLabel)
  const isEmptyKey = !hasInputs && !groups.length
  const setIsExpanded = () => dispatch({ type: 'TOGGLE_KEY_EXPANDED', payload: !isKeyExpanded })

  useEffect(() => {
    if (!isKeyExpanded) {
      return
    }
    const lastRef = activeRef.current
    const nextTabStop = findTabStop(lastRef, 'next')
    nextTabStop?.focus()
  }, [isKeyExpanded])

  if (!legend.key) {
    return null
  }

  return (
    <div id={`${id}-key`} className='fm-c-layers'>
      {groups.map((g, i) => (
        <Fragment key={`fl${i}`}>
          {(isKeyExpanded || (!isKeyExpanded && i <= maxRow)) && (
            <LayerGroup key={`lg${i}`} group={g} id={`l${i}`} display={display} hasSymbols={hasSymbols} hasInputs={hasInputs} />
          )}
        </Fragment>
      ))}
      {(maxRow < (groups.length - 1)) && (
        <div className='fm-c-layers__more fm-c-layers__more--centre'>
          <More id={`${id}-key`} label={moreLabel} isExpanded={isKeyExpanded} setIsExpanded={setIsExpanded} isRemove />
        </div>
      )}
      {isEmptyKey && (
        <p className='govuk-body-s govuk-!-margin-bottom-0'>No features displayed</p>
      )}
    </div>
  )
}
