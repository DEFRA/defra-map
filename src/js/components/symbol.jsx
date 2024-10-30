import React, { useEffect, useState } from 'react'
import { useViewport } from '../store/use-viewport'
import { parseSVG } from '../lib/symbols'

export default function Symbol ({ item, display }) {
  const { basemap } = useViewport()
  const isDarkBasemap = ['dark', 'aerial'].includes(basemap)

  const [svg, setSvg] = useState(null)

  useEffect(() => {
    if (!item?.icon) return
    fetch(item.icon).then(response => response.text()).then(text => setSvg(
      { __html: parseSVG(item.icon, fill, text, isDarkBasemap) }
    ))
  }, [item?.icon])

  const fills = item?.fill?.replace(/\s/g, '').split(',').map(f => f.includes(':') ? f : `default:${f}`)
  const fill = fills?.length ? (fills.find(f => f.includes(basemap)) || fills[0]).split(':')[1] : null

  return (
    <>
      {display === 'icon'
        ? (
          <div className={`fm-c-layers__image fm-c-layers__image--${display}`} dangerouslySetInnerHTML={svg} />
        ) : null}
      {display === 'fill'
        ? (
          <div className={`fm-c-layers__image fm-c-layers__image--${display}`}>
            <svg width='40' height='40' viewBox='0 0 40 40' fill={fill}>
              <path d='M8 8h24v24H8z' />
            </svg>
          </div>
        ) : null}
      {display === 'query-polygon'
        ? (
          <div className={`fm-c-layers__image fm-c-layers__image--${display}`}>
            <svg width='40' height='40' viewBox='0 0 40 40' fill='none'>
              <path d='M9 9h22v22H9z' />
            </svg>
          </div>
        ) : null}
      {display === 'ramp'
        ? (
          <div className={`fm-c-layers__image fm-c-layers__image--${display}`}>
            <svg viewBox='0 0 5 5' preserveAspectRatio='none' fill={fill} stroke={fill} strokeWidth={1}>
              <path d='M0 0h5v5H0z' />
            </svg>
          </div>
        ) : null}
    </>
  )
}
