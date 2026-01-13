import React, { useRef, useEffect, useState } from 'react'
import { computeInset } from './utils.js'

export function Frame({ appState, pluginState }) {
  const { actionsRef, mainRef, footerRef } = appState.layoutRefs
  const elRef = useRef(null)
  const [parentInset, setParentInset] = useState('65px')
  const [childStyle, setChildStyle] = useState(null)

  useEffect(() => {
    if (!pluginState.frame || !elRef.current) return

    const parent = elRef.current

    const updateLayout = () => {
      if (!actionsRef.current || !mainRef.current || !footerRef.current) return

      // Parent inset
      const mainHeight = mainRef.current.offsetHeight
      const footerTop = footerRef.current.offsetTop
      const actionsTop = actionsRef.current.offsetTop
      const offsetBottom = mainHeight - Math.min(actionsTop, footerTop) + 10
      setParentInset(`65px 65px ${offsetBottom}px 65px`)

      // Child sizing relative to parent
      const { offsetWidth: parentWidth, offsetHeight: parentHeight } = parent

      // Flicker prevention: only calculate child when parent has stabilized
      if (mainHeight - offsetBottom - parent.offsetTop !== parent.offsetHeight) {
        return
      }

      const { top, left, width, height } = computeInset(
        parentWidth,
        parentHeight,
        pluginState.frame,
        appState.breakpoint
      )

      // Adjust to grandparent coordinates
      const childTop = top + parent.offsetTop
      const childLeft = left + parent.offsetLeft

      setChildStyle({
        position: 'absolute',
        top: `${childTop}px`,
        left: `${childLeft}px`,
        width: `${width}px`,
        height: `${height}px`
      })
    }

    const observer = new ResizeObserver(updateLayout)
    observer.observe(parent)

    // Initial calculation
    updateLayout()

    return () => observer.disconnect()
  }, [pluginState.frame, appState.breakpoint, actionsRef, mainRef, footerRef])

  if (!pluginState.frame) return null

  return (
    <>
      {/* Parent remains as before */}
      <div className="dm-c-frame" style={{ inset: parentInset }} ref={elRef} />

      {/* Child as sibling, positioned relative to grandparent */}
      {childStyle && <div className="dm-c-frame-display" style={childStyle} />}
    </>
  )
}
