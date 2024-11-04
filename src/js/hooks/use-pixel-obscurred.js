import { useEffect, useState } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport.js'

// Hook that alerts if pixel is obscured

export const usePixelObscurred = () => {
  const { provider, info, viewportRef, targetMarker, isMobile, padding } = useApp()
  const { size } = useViewport()

  const [isObscurred, setIsObscurred] = useState(false)

  useEffect(() => {
    if (targetMarker?.coord && provider.map) {
      let pixel = provider.getPixel(targetMarker.coord)
      const scale = size === 'large' ? 2 : 1
      pixel = pixel.map(c => c * scale)
      const { top, left } = viewportRef.current.getBoundingClientRect()
      const topEl = document.elementFromPoint(pixel[0] + left, pixel[1] + top)
      setIsObscurred(!!topEl?.closest('.fm-c-panel--info'))
    }

    return () => {
      setIsObscurred(false)
    }
  }, [provider.map, isMobile, padding, info, targetMarker])

  return [isObscurred]
}
