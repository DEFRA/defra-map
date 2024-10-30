import React, { useEffect, useRef, useState } from 'react'
import { ViewportProvider } from '../store/viewport-provider.jsx'
import { useApp } from '../store/use-app'
import { defaults, events, settings } from '../store/constants'
import { updateTitle, toggleInert, constrainFocus } from '../lib/dom'
import eventBus from '../lib/eventbus'
import Viewport from './viewport.jsx'
import Exit from './exit.jsx'
import Search from './search.jsx'
import Panel from './panel.jsx'
import Segments from './segments.jsx'
import Layers from './layers.jsx'
import DrawStart from './draw-start.jsx'
import Styles from './styles.jsx'
import Keyboard from './keyboard.jsx'
import LegendButton from './legend-button.jsx'
import KeyButton from './key-button.jsx'
import DrawFinish from './draw-finish.jsx'
import SearchButton from './search-button.jsx'
import StylesButton from './styles-button.jsx'
import Zoom from './zoom.jsx'
import Reset from './reset.jsx'
import Location from './location.jsx'
import Attribution from './attribution.jsx'
import Error from './error.jsx'
import ViewportLabel from './viewport-label.jsx'
import DrawCancel from './draw-cancel.jsx'
import DrawEdit from './draw-edit.jsx'
import QueryButton from './query-button.jsx'
import Help from './help.jsx'
import HelpButton from './help-button.jsx'
import Tooltip from './tooltip.jsx'

export default function Container () {
  // Derived from state and props
  const { dispatch, provider, options, parent, info, search, queryPolygon, mode, activePanel, isPage, isMobile, isDesktop, activeRef, viewportRef, query, error } = useApp()
  const { id } = options

  // Refs to elements
  const legendBtnRef = useRef(null)
  const keyBtnRef = useRef(null)
  const searchBtnRef = useRef(null)
  const stylesBtnRef = useRef(null)
  const helpBtnRef = useRef(null)
  const cancelBtnRef = useRef(null)
  const maskRef = useRef(null)

  // Expanded panels
  const [isKeyExpanded, setIsKeyExpanded] = useState()

  // Template properties
  const type = settings.container[options.type || defaults.CONTAINER_TYPE].CLASS
  const device = isMobile ? 'mobile' : isDesktop ? 'desktop' : 'tablet'
  const height = (isPage || options.target) ? '100%' : options.height || settings.container[options.type].HEIGHT
  const legend = options.legend
  const isLegendInset = legend?.display === 'inset'
  const isLegendFixed = !isLegendInset && isDesktop
  const isLegendModal = !isLegendFixed && (!isLegendInset || (isLegendInset && isKeyExpanded))
  const hasLengedHeading = !(legend.display === 'inset' || (isLegendFixed && isPage))
  const isQueryMode = ['frame', 'draw'].includes(mode)
  const hasLegendButton = legend && !isQueryMode && !(isDesktop && !isLegendInset)
  const hasKeyButton = legend && !isQueryMode && !legend.display
  const isOffset = (isLegendInset && isPage) || !!search || (hasLegendButton && ['INFO', 'KEY'].includes(activePanel)) || (hasKeyButton && activePanel !== 'KEY')
  const hasDrawButtons = isQueryMode && !(isDesktop && !isLegendInset)
  const hasExitButton = !isQueryMode && isPage && !(isDesktop && !isLegendInset)
  const hasSearchButton = !isQueryMode && search && !(isDesktop && search?.isExpanded)
  const hasSearchPanel = !isQueryMode && (activePanel === 'SEARCH' || (isDesktop && search?.isExpanded))
  const hasQueryButton = !isQueryMode && query && activePanel !== 'INFO' && !(isMobile && activePanel === 'KEY')

  // Communication between Vanilla JS and React components
  useEffect(() => {
    eventBus.on(parent, events.SET_INFO, data => { dispatch({ type: 'SET_INFO', data }) })
    eventBus.on(parent, events.SET_SELECTED, data => { dispatch({ type: 'SET_SELECTED', id: data }) })
    eventBus.on(parent, events.SET_DRAW, data => { dispatch({ type: 'SET_DRAW', data }) })

    // Ready for map
    if (!(info || legend?.isVisible)) {
      dispatch({ type: 'CONTAINER_READY' })
    }
  }, [])

  // Toggle inert elements
  useEffect(() => {
    activeRef.current?.focus()
    updateTitle()
    toggleInert()
  }, [isPage, activePanel])

  return (
    <ViewportProvider options={options}>
      <div className={`fm-o-container fm-${device} ${type}${isQueryMode ? ' fm-draw' : ''}`} {...{ onKeyDown: constrainFocus }} style={{ height, width: '100%' }} {...(isPage ? { 'data-fm-page': options.pageTitle || 'Map view' } : {})} data-fm-container=''>
        {isDesktop && !isLegendInset
          ? (
            <div className='fm-o-side'>
              {!isQueryMode && isPage ? <Exit /> : null}
              {!isQueryMode
                ? (
                  <Panel className='legend' label={legend.title} width={legend.width} isFixed={isLegendFixed} isHideHeading={!hasLengedHeading}>
                    <DrawStart />
                    <Segments />
                    <Layers hasSymbols={!!legend.display} hasInputs isExpanded={isKeyExpanded} setIsExpanded={setIsKeyExpanded} />
                  </Panel>
                  )
                : <Help focusRef={cancelBtnRef} heading={queryPolygon.helpLabel} body={queryPolygon.html} />}
            </div>
            )
          : null}
        <div className='fm-o-main'>
          <Viewport />
          <div className={`fm-o-inner${isLegendInset ? ' fm-o-inner--inset' : ''}${isOffset ? ' fm-o-inner--offset-top' : ''}`}>
            <div className='fm-o-top'>
              <div className='fm-o-top__column'>
                {hasExitButton ? <Exit /> : null}
                {!isMobile && hasSearchButton
                  ? (
                    <Tooltip id={`${id}-search-label`} position='below' text='Show search'>
                      <SearchButton ariaLabelledby={`${id}-search-label`} searchBtnRef={searchBtnRef} />
                    </Tooltip>
                    )
                  : null}
                {!isMobile && hasSearchPanel ? <Search instigatorRef={searchBtnRef} /> : null}
                {hasLegendButton ? <LegendButton legendBtnRef={legendBtnRef} /> : null}
                {hasKeyButton ? <KeyButton keyBtnRef={keyBtnRef} /> : null}
                {hasDrawButtons ? <HelpButton helpBtnRef={helpBtnRef} label={queryPolygon.helpLabel} /> : null}
              </div>
              <div className='fm-o-top__column'>
                <ViewportLabel />
                {isQueryMode ? <DrawEdit /> : null}
              </div>
              <div className='fm-o-top__column'>
                {isMobile && hasSearchButton
                  ? (
                    <Tooltip id={`${id}-search-label`} position='left' text='Show search'>
                      <SearchButton ariaLabelledby={`${id}-search-label`} searchBtnRef={searchBtnRef} />
                    </Tooltip>
                    )
                  : null}
                {isMobile && hasSearchPanel ? <Search instigatorRef={searchBtnRef} /> : null}
              </div>
            </div>
            {activePanel === 'KEY' && !isMobile
              ? (
                <Panel isInset isNotObscure={false} className='key' label='Key' width={legend.keyWidth || legend.width} instigatorRef={keyBtnRef} isModal={isKeyExpanded} setIsModal={setIsKeyExpanded}>
                  <Layers hasSymbols hasInputs={false} isExpanded={isKeyExpanded} setIsExpanded={setIsKeyExpanded} />
                </Panel>
                )
              : null}
            {info && activePanel === 'INFO' && !isMobile
              ? <Panel className='info' isInset isNotObscure label={info.label} width={info.width} html={info.html} instigatorRef={viewportRef} isModal={false} />
              : null}
            {activePanel === 'LEGEND' && !(isMobile && isLegendInset) && !(isDesktop && !isLegendInset)
              ? (
                <Panel className='legend' isNotObscure={false} label={legend.title} width={legend.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isModal={isLegendModal} setIsModal={setIsKeyExpanded} isHideHeading={!hasLengedHeading}>
                  <DrawStart />
                  <Segments />
                  <Layers hasSymbols={!!legend.display} hasInputs isExpanded={isKeyExpanded} setIsExpanded={setIsKeyExpanded} />
                </Panel>
                )
              : null}
            {activePanel === 'HELP' && !(isMobile && isLegendInset) && !(isDesktop && !isLegendInset)
              ? <Help instigatorRef={helpBtnRef} heading={queryPolygon.helpLabel} body={queryPolygon.html} />
              : null}
            <div className='fm-o-bottom'>
              <div className='fm-o-footer'>
                <Attribution />
                {isQueryMode && !isMobile
                  ? (
                    <div className='fm-o-actions'>
                      <DrawFinish />
                      <DrawCancel cancelBtnRef={cancelBtnRef} />
                    </div>
                    )
                  : null}
                {hasQueryButton && !isMobile
                  ? (
                    <div className='fm-o-actions'>
                      <QueryButton />
                    </div>
                    )
                  : null}
                <div className='fm-o-buttons' {...(activePanel === 'STYLE' ? { style: { display: 'none' } } : {})}>
                  {options.hasReset ? <Reset /> : null}
                  {options.hasGeoLocation
                    ? (
                      <Tooltip id={`${id}-location-label`} position='left' text='Use your location'>
                        <Location ariaLabelledby={`${id}-location-label`} provider={provider} />
                      </Tooltip>
                      )
                    : null}
                  {!isMobile ? <Zoom /> : null}
                  {provider.basemaps && Object.keys(provider?.basemaps).length
                    ? (
                      <Tooltip id={`${id}-style-label`} position='left' cssModifier='style' text='Choose map style'>
                        <StylesButton ariaLabelledby={`${id}-style-label`} stylesBtnRef={stylesBtnRef} />
                      </Tooltip>
                      )
                    : null}
                </div>
              </div>
              {info && activePanel === 'INFO' && isMobile
                ? <Panel isInset isNotObscure className='info' label={info.label} html={info.html} instigatorRef={viewportRef} isModal={false} />
                : null}
              {activePanel === 'KEY' && isMobile
                ? (
                  <Panel isInset isNotObscure className='key' label='Key' instigatorRef={keyBtnRef} isModal={isKeyExpanded} setIsModal={setIsKeyExpanded}>
                    <Layers hasSymbols hasInputs={false} isExpanded={isKeyExpanded} setIsExpanded={setIsKeyExpanded} />
                  </Panel>
                  )
                : null}
              {activePanel === 'LEGEND' && isMobile && isLegendInset
                ? (
                  <Panel className='legend' isNotObscure label={legend.title} width={legend.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isFixed={isLegendFixed} isModal={isLegendModal} setIsModal={setIsKeyExpanded} isHideHeading={!hasLengedHeading}>
                    <DrawStart />
                    <Segments />
                    <Layers hasSymbols hasInputs isExpanded={isKeyExpanded} setIsExpanded={setIsKeyExpanded} />
                  </Panel>
                  )
                : null}
              {isQueryMode && isMobile
                ? (
                  <div className='fm-o-actions'>
                    <DrawFinish />
                    <DrawCancel cancelBtnRef={cancelBtnRef} />
                  </div>
                  )
                : null}
              {hasQueryButton && isMobile
                ? (
                  <div className='fm-o-actions'>
                    <QueryButton />
                  </div>
                  )
                : null}
            </div>
          </div>
          {activePanel === 'STYLE'
            ? (
              <Panel isInset label='Map style' instigatorRef={stylesBtnRef} width='400px' isModal>
                <Styles />
              </Panel>
              )
            : null}
          {['KEYBOARD', 'ERROR'].includes(activePanel)
            ? (
              <div className='fm-o-mask' ref={maskRef}>
                {activePanel === 'KEYBOARD'
                  ? (
                    <Panel isInset width='500px' maxWidth='500px' label='Keyboard' instigatorRef={viewportRef} isOutsideInteract isModal>
                      <Keyboard />
                    </Panel>
                    )
                  : null}
                {activePanel === 'ERROR'
                  ? (
                    <Panel isInset maxWidth='300px' label={error.label} instigatorRef={viewportRef} isOutsideInteract isModal>
                      <Error />
                    </Panel>
                    )
                  : null}
              </div>
              )
            : null}
        </div>
      </div>
    </ViewportProvider>
  )
}
