import React, { useEffect, Fragment } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { findTabStop } from '../lib/dom.js'
import { parseGroups } from '../lib/query.js'
import More from './more.jsx'
import LayerGroup from './layer-group.jsx'

export default function Layers ({ hasSymbols, hasInputs }) {
  const { dispatch, query, segments, options, activeRef, layers, isKeyExpanded } = useApp()
  const { id, legend, draw } = options
  const { currentZoom } = useViewport()

  // Derived properties
  const hasHiddenGroups = legend?.key.some(item => item.isHidden)
  const queryLabel = query ? draw?.keyLabel : null
  const groups = parseGroups(legend?.key, segments, layers, currentZoom, hasInputs, queryLabel)
  const isEmptyKey = !hasInputs && !groups.length
  const setIsExpanded = () => dispatch({ type: 'TOGGLE_KEY_EXPANDED', payload: !isKeyExpanded })

  useEffect(() => {
    if (!isKeyExpanded) {
      return
    }
    const lastRef = activeRef.current
    const nextTabStop = findTabStop(lastRef, 'next')
    const isLayer = document.getElementById(`${id}-key`).contains(nextTabStop)
    isLayer ? nextTabStop?.focus() : lastRef?.focus()
  }, [isKeyExpanded])

  if (!legend?.key) {
    return null
  }

  return (
    <div id={`${id}-key`} className='fm-c-layers'>
      {groups.map((g, i) => (
        <Fragment key={`fl${i}`}>
          {(isKeyExpanded || !g.isHidden) && (
            <LayerGroup key={`lg${i}`} group={g} id={`l${i}`} display={legend?.display} hasSymbols={hasSymbols} hasInputs={hasInputs} />
          )}
        </Fragment>
      ))}
      {!isKeyExpanded && hasHiddenGroups && (
        <div className='fm-c-layers__more fm-c-layers__more--center'>
          <More id={`${id}-key`} label='All layers' isExpanded={isKeyExpanded} setIsExpanded={setIsExpanded} isRemove />
        </div>
      )}
      {isEmptyKey && (
        <p className='fm-c-layers__error'>No features displayed</p>
      )}
    </div>
  )
}
