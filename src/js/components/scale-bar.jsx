import React, { useRef, useState, useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
import { getBestScale } from '../lib/get-best-scale.js'

export default function ScaleBar () {
  const { resolution, style, isReady } = useViewport()
  const { options } = useApp()
  const hasScaleBar = ['imperial', 'metric'].includes(options?.scaleBar)

  const elRef = useRef(null)
  const [scale, setScale] = useState({ width: 0, label: '' })

  const MAX_WIDTH = 120
  const CSS_SCALE = 1

  const isVisible = scale.width >= 0

  useEffect(() => {
    if (hasScaleBar && resolution) {
      const metersPerPx = resolution / CSS_SCALE
      const best = getBestScale(metersPerPx, MAX_WIDTH, options.scaleBar)
      setScale(best)
    }
  }, [resolution])

  if (!hasScaleBar) {
    return null
  }

  return (
    <>
      {isVisible && (
        <div className={`fm-c-scale${!isReady ? ' fm-u-hidden' : ''} fm-c-scale--${style?.name}`} ref={elRef} style={{ width: `${scale.width}px` }}>
          <span className='fm-c-scale__label'>
            <span className='fm-u-visually-hidden'>Scale bar: </span>
            {scale.label}
            <span aria-hidden> {scale.symbol}</span>
            <span className='fm-u-visually-hidden'>{scale.unit}</span>
          </span>
        </div>
      )}
    </>
  )
}
