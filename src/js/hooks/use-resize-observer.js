import { useEffect, useRef } from 'react'

/**
* Hook that alerts panel size change
*/

export const useResizeObserver = (el, callback) => {
  const observer = useRef(null)
  const prevWidth = useRef(null)
  const prevHeight = useRef(null)

  const observe = () => {
    if (el && observer.current) {
      observer.current.observe(el)
    }
  }

  useEffect(() => {
    if (observer.current && el) {
      observer.current.unobserve(el)
    }
    if (window.ResizeObserver) {
      observer.current = new window.ResizeObserver(entries => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          if ((typeof height === 'number' && height !== prevHeight.current) || (typeof width === 'number' && width !== prevWidth.current)) {
            prevWidth.current = width
            prevHeight.current = height
            callback()
          }
        }
      })
      observe()
    }

    return () => {
      if (observer.current && el) {
        observer.current.unobserve(el)
      }
    }
  }, [el, window.ResizeObserver])
}
