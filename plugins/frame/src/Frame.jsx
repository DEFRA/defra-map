// src/plugins/scaleBar/ScaleBarInit.jsx
import React, { useRef } from 'react'

export function Frame ({ appState, pluginState }) {
  const { actionsRef, mainRef, footerRef } = appState.layoutRefs
  const elRef = useRef(null)

  if (!actionsRef.current || !pluginState.frame) {
    return
  }
  const mainOffsetHeight = mainRef.current.offsetHeight
  const actionsOffsetTop = actionsRef.current.offsetTop
  const footerOffsetTop = footerRef.current.offsetTop

  const inset = `65px 65px ${(mainOffsetHeight - Math.min(actionsOffsetTop, footerOffsetTop)) + 10}px 65px`

  return (
    <div className="dm-c-frame" style={{ inset }} ref={elRef} />
  )
}
