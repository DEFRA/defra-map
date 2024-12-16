import React, { Fragment } from 'react'
import { useApp } from '../store/use-app'
import SegmentGroup from './segment-group.jsx'

export default function Segments () {
  const { segments, legend } = useApp()
  if (!legend.segments) {
    return null
  }

  // Only segments with an active parent
  let groups = legend.segments.filter(s => s.parentIds ? s.parentIds.some(i => segments.includes(i)) : s)

  // Add display properties
  groups = groups.map(g => {
    const isDetails = !g.type && g.heading && g.collapse && ['expanded', 'collapse'].includes(g.collapse)
    return {
      ...g,
      isDetails,
      isExpanded: isDetails && g?.collapse === 'expanded'
    }
  })

  return (
    <>
      {groups.map((group, i) => (
        <Fragment key={`gs${i}`}>
          <SegmentGroup group={group} id={`s${i}`} />
        </Fragment>
      ))}
    </>
  )
}
