import { useLayoutEffect } from 'react'
import { useResizeObserver } from './useResizeObserver.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { getSafeZoneInset } from '../../utils/getSafeZoneInset.js'

export function useLayoutMeasurements () {
  const { dispatch, breakpoint, layoutRefs } = useApp()
  const { mapSize, isMapReady } = useMap()

  const {
    mainRef,
    topRef,
    topLeftColRef,
    topRightColRef,
    insetRef,
    bottomRef,
    actionsRef
  } = layoutRefs

  // -----------------------------
  // 1. Calculate layout CSS vars (side effect)
  // -----------------------------
  const calculateLayout = () => {
    const main = mainRef.current
    const top = topRef.current
    const topLeftCol = topLeftColRef.current
    const topRightCol = topRightColRef.current
    const inset = insetRef.current
    const bottom = bottomRef.current
    const actions = actionsRef.current

    if (!main || !top || !inset || !bottom) {
      return
    }

    const root = document.documentElement
    const dividerGap = parseInt(getComputedStyle(root).getPropertyValue('--divider-gap'), 10)

    // === Inset offsets ===
    const insetOffsetTop = topLeftCol.offsetHeight + top.offsetTop
    const insetMaxHeight = main.offsetHeight - insetOffsetTop - top.offsetTop
    root.style.setProperty('--inset-offset-top', `${insetOffsetTop}px`)
    root.style.setProperty('--inset-max-height', `${insetMaxHeight}px`)

    // === Bottom left offset ===
    const insetBottom = inset.offsetHeight + insetOffsetTop
    const bottomOffsetTop = Math.min(bottom.offsetTop, actions.offsetTop)
    const bottomOffsetLeft = bottomOffsetTop - dividerGap > insetBottom ? 0 : inset.offsetLeft + inset.offsetWidth
    root.style.setProperty('--offset-left', `${bottomOffsetLeft}px`)

    // === Right container offsets ===
    const rightOffsetTop = topRightCol.offsetHeight + top.offsetTop
    const rightOffsetBottom = main.offsetHeight - bottom.offsetTop + dividerGap
    root.style.setProperty('--right-offset-top', `${rightOffsetTop}px`)
    root.style.setProperty('--right-offset-bottom', `${rightOffsetBottom}px`)

    // === Top column width ===
    const leftWidth = topLeftCol.offsetWidth || 0
    const rightWidth = topRightCol.offsetWidth || 0
    const finalWidth = leftWidth || rightWidth ? Math.max(leftWidth, rightWidth) : 0
    root.style.setProperty('--top-col-width', `${finalWidth}px`)
  }

  // --------------------------------
  // 2. Run when breakpoint and mapSize change
  // --------------------------------
  useLayoutEffect(() => {
    requestAnimationFrame(() => { // Required for Preact
      calculateLayout()

      // === Set safe zone inset ===
      const safeZoneInset = getSafeZoneInset(layoutRefs)
      dispatch({ type: 'SET_SAFE_ZONE_INSET', payload: { safeZoneInset: safeZoneInset }})
    })
  }, [breakpoint, mapSize, isMapReady])

  // --------------------------------
  // 3. Recaluclate CSS vars when elements resize
  // --------------------------------
  useResizeObserver([topRightColRef, mainRef, insetRef, actionsRef], () => {
    requestAnimationFrame(() => {
      calculateLayout()
    })
  })
}
