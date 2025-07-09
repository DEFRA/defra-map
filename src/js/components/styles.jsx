import React, { useRef, useState, createRef, useEffect } from 'react'
import { useApp } from '../store/use-app'
import { useViewport } from '../store/use-viewport'
import { findTabStop } from '../lib/dom.js'
import { StyleItem } from './style-item.jsx'
import { capabilities } from '../lib/capabilities.js'
import More from './more.jsx'

export default function Styles () {
  const { options } = useApp()
  const { id, framework, hasAutoMode } = options
  const { size, style, styles } = useViewport()
  const appDispatch = useApp().dispatch
  const viewportDispatch = useViewport().dispatch
  const currentStyleName = style.name
  const currentSize = size
  const buttonsRef = useRef([])
  const [isExpanded, setIsExpanded] = useState(styles.map(s => s.name).indexOf(currentStyleName) > 2 || size !== 'small')
  buttonsRef.current = styles.map(s => s.name).map((_, i) => buttonsRef.current[i] ?? createRef())

  const hasSize = capabilities[framework || 'default'].hasSize
  const moreLabel = `${isExpanded ? 'Fewer' : 'More'} styles`

  const MIN_COLS = 3

  const handleSizeClick = e => {
    // activeRef.current = null
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
    const colourScheme = (hasAutoMode && window?.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
    appDispatch({ type: 'SET_IS_DARK_MODE', payload: { style, colourScheme } })
  }, [style])

  return (
    <div id='map-styles' className='fm-c-layers fm-c-layers--style'>
      <div className='fm-c-layers__group' role='group' aria-labelledby={`${id}-map-panel-label`}>
        <div className='fm-c-layers__columns'>
          {styles.filter((_, i) => isExpanded ? i >= 0 : i < MIN_COLS).map((item, i) => (
            <StyleItem key={item.name} item={item} currentStyleName={currentStyleName} ref={buttonsRef.current[i]} />
          ))}
        </div>
      </div>
      {hasSize && isExpanded && (
        <div className='fm-c-layers__group' role='group' aria-labelledby={`${id}-text-sizes`}>
          <div id={`${id}-text-sizes`} className='fm-c-layers__header'>
            <h3 className='fm-c-layers__heading govuk-body-s'>Text size</h3>
          </div>
          <div className='fm-c-layers__columns'>
            {['small', 'medium', 'large'].map((name, i) => (
              <div key={name} className='fm-c-layers__item govuk-body-s'>
                <button className='fm-c-layers__button' value={name} aria-pressed={currentSize === name} onClick={handleSizeClick}>
                  <div className='fm-c-layers__image'>
                    <svg width='60' height='60' viewBox='0 0 60 60' fillRule='evenodd'>
                      <rect width='100%' height='100%' fill='#f3f2f1' />
                      <g style={{ transform: `scale(${1 + (i / 2)})`, transformOrigin: `8px ${50 + i}px` }}>
                        <path d='M8 51.785L12.948 38.9h1.837l5.274 12.885h-1.943l-1.503-3.903h-5.387l-1.415 3.903H8zm3.718-5.291h4.368l-1.345-3.569-.914-2.671c-.164.826-.395 1.646-.694 2.46l-1.415 3.78zm15.592 4.139c-3.698 3.143-7.836.271-6.315-2.562.963-1.794 5.529-1.982 6.183-2.21.022-.825.052-2.27-2.241-2.312-1.751-.031-2.242 1.025-2.435 1.776l-1.547-.211c.234-1.102.963-2.856 4.21-2.874 4.037-.022 3.612 2.962 3.612 3.524v2.11c0 .315 0 3.012.501 3.911h-1.652c-.164-.328-.27-.712-.316-1.152zm-.132-3.533c-.907.37-3.444.694-3.964.914-1.293.548-.911 2.399.225 2.637.639.134 3.739.476 3.739-2.971v-.58z' />
                      </g>
                    </svg>
                  </div>
                  {name[0].toUpperCase() + name.slice(1)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {(styles.length > 3 || hasSize) && (
        <div className='fm-c-layers__more fm-c-layers__more--center'>
          <More id={`${id}-styles`} label={moreLabel} isExpanded={isExpanded} setIsExpanded={() => setIsExpanded(!isExpanded)} isRemove />
        </div>
      )}
    </div>
  )
}
