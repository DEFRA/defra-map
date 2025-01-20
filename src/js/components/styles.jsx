import React, { useRef, useState, createRef, useEffect } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { findTabStop } from '../lib/dom.js'
import { getImagePos } from '../lib/utils.js'
import { capabilities } from '../lib/capabilities.js'
import image from '../lib/style-image.json'
import More from './more.jsx'

export default function Styles () {
  const { options, provider, activeRef } = useApp()
  const { id, framework } = options
  const { basemaps } = provider
  const { basemap, size } = useViewport()
  const appDispatch = useApp().dispatch
  const viewportDispatch = useViewport().dispatch

  const currentBasemap = basemap
  const currentSize = size
  const buttonsRef = useRef([])
  const [isExpanded, setIsExpanded] = useState(basemaps.indexOf(currentBasemap) > 2 || size !== 'small')
  buttonsRef.current = basemaps.map((_, i) => buttonsRef.current[i] ?? createRef())

  const hasSize = capabilities[framework || 'default'].hasSize
  const moreLabel = `${isExpanded ? 'Fewer' : 'More'} styles`

  const MIN_COLS = 3

  const handleBasemapClick = e => {
    activeRef.current = null
    viewportDispatch({ type: 'SET_BASEMAP', payload: { basemap: e.currentTarget.value } })
  }

  const handleSizeClick = e => {
    activeRef.current = null
    viewportDispatch({ type: 'SET_SIZE', payload: e.currentTarget.value })
  }

  // Set initial focus
  useEffect(() => {
    if (!isExpanded) {
      return
    }
    const index = buttonsRef.current.length < MIN_COLS ? buttonsRef.current.length - 1 : 2
    const el = buttonsRef.current[index].current
    const nextTabStop = findTabStop(el, 'next')
    nextTabStop.focus()
  }, [isExpanded])

  // Toggle dark mode
  useEffect(() => {
    const colourScheme = window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    appDispatch({ type: 'SET_IS_DARK_MODE', payload: { basemap, colourScheme } })
  }, [basemap])

  return (
    <div id='map-styles' className='fm-c-layers fm-c-layers--style'>
      <div className='fm-c-layers__group' role='group' aria-labelledby={`${id}-map-panel-label`}>
        <div className='fm-c-layers__columns'>
          {basemaps.filter((_b, i) => isExpanded ? i >= 0 : i < MIN_COLS).map((name, i) => (
            <div key={name} className='fm-c-layers__item govuk-body-s'>
              <button className='fm-c-layers__button' value={name} aria-pressed={currentBasemap === name} ref={buttonsRef.current[i]} onClick={handleBasemapClick}>
                <div className='fm-c-layers__image'>
                  <img src={image.src} draggable={false} width='120px' height='120px' alt='' style={{ objectPosition: getImagePos(name) }} />
                </div>
                {{
                  default: 'Default',
                  dark: 'Dark',
                  aerial: 'Aerial',
                  deuteranopia: 'Green-red enhanced',
                  tritanopia: 'Blue-yellow enhanced',
                  'high-contrast': 'High contrast'
                }[name]}
              </button>
            </div>
          ))}
        </div>
      </div>
      {hasSize && isExpanded && (
        <div className='fm-c-layers__group' role='group' aria-labelledby={`${id}-text-sizes`}>
          <div id={`${id}-text-sizes`} className='fm-c-layers__header'>
            <h3 className='fm-c-layers__heading govuk-body-s'>Text size</h3>
          </div>
          <div className='fm-c-layers__columns'>
            {['small', 'large'].map(name => (
              <div key={name} className='fm-c-layers__item govuk-body-s'>
                <button className='fm-c-layers__button' value={name} aria-pressed={currentSize === name} onClick={handleSizeClick}>
                  <div className='fm-c-layers__image'>
                    <img src={image.src} draggable={false} width='120px' height='120px' alt='' style={{ objectPosition: getImagePos(name) }} />
                  </div>
                  {name[0].toUpperCase() + name.slice(1)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {(basemaps.length > 3 || hasSize) && (
        <div className='fm-c-layers__more fm-c-layers__more--centre'>
          <More id={`${id}-styles`} label={moreLabel} isExpanded={isExpanded} setIsExpanded={() => setIsExpanded(!isExpanded)} isRemove />
        </div>
      )}
    </div>
  )
}
