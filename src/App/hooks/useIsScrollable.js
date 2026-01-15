import { useState, useCallback } from 'react'
import { useResizeObserver } from './useResizeObserver.js'

export function useIsScrollable (targetRef) {
  const [isScrollable, setIsScrollable] = useState(false)

  const checkScrollable = useCallback(() => {
    const el = targetRef?.current
    if (el) {
      setIsScrollable(el.scrollHeight > el.clientHeight)
    }
  }, [targetRef])

  useResizeObserver(targetRef, checkScrollable)

  return isScrollable
}
