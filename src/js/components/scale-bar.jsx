import React, { useRef, useState, useEffect } from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

export default function ScaleBar () {
  const { resolution, style, isReady } = useViewport()
  const { options } = useApp()
  const hasScaleBar = ['imperial', 'metric'].includes(options?.scaleBar)

  const elRef = useRef(null)
  const [scale, setScale] = useState({ width: 0, label: '' })

  const MAX_WIDTH = 120
  const CSS_SCALE = 1

  const isVisible = scale.width >= 0

  const units = {
    metric: [
      { threshold: 1, symbol: 'm', unit: 'metre', plural: 'metres', factor: 1 },
      { threshold: 1000, symbol: 'km', unit: 'kilometre', plural: 'kilometres', factor: 0.001 }
    ],
    imperial: [
      { threshold: 1609.344, symbol: 'mi', unit: 'mile', plural: 'miles', factor: 1 / 1609.344 },
      { threshold: 0.9144, symbol: 'yd', unit: 'yard', plural: 'yards', factor: 1 / 0.9144 },
      { threshold: 0.3048, symbol: 'ft', unit: 'foot', plural: 'feet', factor: 1 / 0.3048 }
    ]
  }

  const getBestScale = (metersPerPx, maxWidthPx, unitSystem) => {
    const maxMeters = metersPerPx * maxWidthPx
    const options = units[unitSystem]

    // Loop over options from *largest to smallest*
    for (const { symbol, unit, plural, factor } of options) {
      const scaled = maxMeters * factor
      const rounded = getRounded(scaled)

      // We want a label like "50 km", not "50000 m"
      if (rounded >= 1 && rounded < 1000) {
        const width = (rounded / factor) / metersPerPx
        if (width <= maxWidthPx) {
          return {
            label: rounded,
            symbol,
            width,
            unit: rounded > 1 ? plural : unit
          }
        }
      }
    }

    // Fallback: pick smallest unit
    const fallback = options[options.length - 1]
    const fallbackScaled = maxMeters * fallback.factor
    const fallbackRounded = getRounded(fallbackScaled)
    const fallbackUnit = fallbackRounded > 1 ? fallback.plural : fallback.unit

    return {
      label: fallbackRounded,
      symbol: fallback.symbol,
      width: (fallbackRounded / fallback.factor) / metersPerPx,
      unit: fallbackUnit
    }
  }

  const getRounded = (num) => {
    // Round to nice numbers: 1, 2, 5, 10, 20, 50, 100...
    const pow10 = Math.pow(10, Math.floor(Math.log10(num)))
    const d = num / pow10
    let rounded
    if (d >= 10) {
      rounded = 10
    } else if (d >= 5) {
      rounded = 5
    } else if (d >= 3) {
      rounded = 3
    } else if (d >= 2) {
      rounded = 2
    } else {
      rounded = 1
    }
    return rounded * pow10
  }

  useEffect(() => {
    if (hasScaleBar && resolution) {
      const metersPerPx = resolution / CSS_SCALE
      const best = getBestScale(metersPerPx, MAX_WIDTH, options.scaleBar)
      setScale(best)
    }
  }, [resolution])

  if (!hasScaleBar) {
    return
  }

  console.log(style)
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