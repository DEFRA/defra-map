import { useEffect, useState } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport.js'
import { getScale } from '../lib/viewport.js'

// Hook that alerts if pixel is obscured

export const usePixelObscurred = () => {
  const { provider, info, viewportRef, targetMarker, isMobile, padding } = useApp()
  const { size } = useViewport()

  const [isObscurred, setIsObscurred] = useState(false)

  useEffect(() => {
    if (targetMarker?.coord && provider.isLoaded) {
      let pixel = provider.getPixel(targetMarker.coord)
      const scale = getScale(size)
      pixel = pixel.map(c => c * scale)
      const { top, left } = viewportRef.current.getBoundingClientRect()
      const topEl = document.elementFromPoint(pixel[0] + left, pixel[1] + top)
      setIsObscurred(!!topEl?.closest('.fm-c-panel--info'))
    }

    return () => {
      setIsObscurred(false)
    }
  }, [provider, isMobile, padding, info, targetMarker])

  return [isObscurred]
}
