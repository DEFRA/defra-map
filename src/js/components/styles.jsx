import React, { useRef, useState, createRef, useEffect } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { findTabStop } from '../lib/dom.js'
import More from './more.jsx'

export default function Styles () {
  const { options, provider, activeRef } = useApp()
  const { id } = options
  const { basemaps, stylesImagePath, getImagePos, hasSize } = provider
  const { basemap, size } = useViewport()
  const viewportDispatch = useViewport().dispatch

  const currentBasemap = basemap
  const currentSize = size
  const buttonsRef = useRef([])
  const [isExpanded, setIsExpanded] = useState(basemaps.indexOf(currentBasemap) > 2 || size !== 'small')
  buttonsRef.current = basemaps.map((_, i) => buttonsRef.current[i] ?? createRef())

  const moreLabel = `${isExpanded ? 'Fewer' : 'More'} styles`

  const handleBasemapClick = e => {
    activeRef.current = null
    const basemap = e.currentTarget.value
    viewportDispatch({ type: 'SET_BASEMAP', basemap })
  }

  const handleSizeClick = e => {
    activeRef.current = null
    const size = e.currentTarget.value
    viewportDispatch({ type: 'SET_SIZE', size })
  }

  // Set initial focus
  useEffect(() => {
    if (!isExpanded) return
    const index = buttonsRef.current.length < 3 ? buttonsRef.current.length - 1 : 2
    const el = buttonsRef.current[index].current
    const nextTabStop = findTabStop(el, 'next')
    nextTabStop.focus()
  }, [isExpanded])

  return (
    <div id='map-styles' className='fm-c-layers fm-c-layers--style'>
      <div className='fm-c-layers__group' role='group' aria-labelledby={`${id}-map-panel-label`}>
        <div className='fm-c-layers__columns'>
          {basemaps.filter((b, i) => isExpanded ? i >= 0 : i < 3).map((basemap, i) => (
            <div key={i} className='fm-c-layers__item govuk-body-s'>
              <button className='fm-c-layers__button' value={basemap} aria-pressed={currentBasemap === basemap} ref={buttonsRef.current[i]} onClick={handleBasemapClick}>
                <div className='fm-c-layers__image'>
                  <img src={stylesImagePath} draggable={false} width='120px' height='120px' alt='' style={{ objectPosition: getImagePos(basemap) }} />
                </div>
                {{
                  default: 'Default',
                  dark: 'Dark',
                  aerial: 'Aerial',
                  deuteranopia: 'Green-red enhanced',
                  tritanopia: 'Blue-yellow enhanced',
                  'high-contrast': 'High contrast'
                }[basemap]}
              </button>
            </div>
          ))}
        </div>
      </div>
      {hasSize && isExpanded
        ? (
          <div className='fm-c-layers__group' role='group' aria-labelledby={`${id}-text-sizes`}>
            <div id={`${id}-text-sizes`} className='fm-c-layers__header'>
              <h3 className='fm-c-layers__heading govuk-body-s'>Text size</h3>
            </div>
            <div className='fm-c-layers__columns'>
              {['small', 'large'].map((size, i) => (
                <div key={i} className='fm-c-layers__item govuk-body-s'>
                  <button className='fm-c-layers__button' value={size} aria-pressed={currentSize === size} onClick={handleSizeClick}>
                    <div className='fm-c-layers__image'>
                      <img src={stylesImagePath} draggable={false} width='120px' height='120px' alt='' style={{ objectPosition: getImagePos(size) }} />
                    </div>
                    {size[0].toUpperCase() + size.slice(1)}
                  </button>
                </div>
              ))}
            </div>
          </div>
          )
        : null}
      {basemaps.length > 3 || provider.hasSize
        ? (
          <div className='fm-c-layers__more fm-c-layers__more--centre'>
            <More id={`${id}-styles`} label={moreLabel} isExpanded={isExpanded} setIsExpanded={setIsExpanded} isRemove />
          </div>
          )
        : null}
    </div>
  )
}
