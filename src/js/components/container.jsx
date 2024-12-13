import React, { useEffect, useRef } from 'react'
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
import Draw from './draw.jsx'
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
import Logo from './logo.jsx'
import MapError from './map-error.jsx'
import ViewportLabel from './viewport-label.jsx'
import DrawEdit from './draw-edit.jsx'
import PixelQueryButton from './pixel-query-button.jsx'
import PolygonQueryButton from './polygon-query-button.jsx'
import HelpButton from './help-button.jsx'

export default function Container () {
  // Derived from state and props
  const { dispatch, provider, options, parent, info, search, queryPolygon, mode, isTargetVisible, activePanel, isPage, isMobile, interfaceType, isDesktop, isDarkMode, isKeyExpanded, activeRef, viewportRef, query, error } = useApp()

  // Refs to elements
  const legendBtnRef = useRef(null)
  const keyBtnRef = useRef(null)
  const searchBtnRef = useRef(null)
  const stylesBtnRef = useRef(null)
  const helpBtnRef = useRef(null)

  // Template properties
  const device = (isMobile && 'mobile') || (isDesktop && 'desktop') || 'tablet'
  const type = settings.container[options.type || defaults.CONTAINER_TYPE].CLASS
  const height = (isPage || options.target) ? '100%' : options.height || settings.container[options.type].HEIGHT
  const legend = options.legend
  const isLegendInset = legend?.display === 'inset'
  const isLegendFixed = isDesktop && !isLegendInset
  const isLegendModal = !isLegendFixed && (!isLegendInset || (isLegendInset && isKeyExpanded))
  const hasLengedHeading = !(legend.display === 'inset' || (isLegendFixed && isPage))
  const isQueryMode = ['frame', 'draw'].includes(mode)
  const hasLegendButton = legend && !isQueryMode && !(isDesktop && !isLegendInset)
  const hasKeyButton = legend && !isQueryMode && !legend.display
  const isLegendInsetPage = isLegendInset && isPage
  const isOffset = isLegendInsetPage || !!search || (hasLegendButton && ['INFO', 'KEY'].includes(activePanel)) || (hasKeyButton && activePanel !== 'KEY')
  const hasHelpButton = isQueryMode && !(isDesktop && !isLegendInset)
  const hasExitButton = !isQueryMode && isPage && !(isDesktop && !isLegendInset)
  const hasSearchButton = search && !isQueryMode && !(isDesktop && search?.isExpanded)
  const hasSearchPanel = activePanel === 'SEARCH' || (isDesktop && search?.isExpanded)
  const hasQueryButton = !isQueryMode && query && activePanel !== 'INFO' && !(isMobile && activePanel === 'KEY')
  const hasSegments = legend.segments
  const hasLayers = legend.key
  const handleColorSchemeMQ = () => dispatch({
    type: 'SET_IS_DARK_MODE',
    payload: { colourScheme: window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }
  })

  // Communication between Vanilla JS and React components
  useEffect(() => {
    eventBus.on(parent, events.SET_INFO, data => { dispatch({ type: 'SET_INFO', payload: data }) })
    eventBus.on(parent, events.SET_SELECTED, data => { dispatch({ type: 'SET_SELECTED', payload: { featureId: data } }) })
    eventBus.on(parent, events.SET_DRAW, data => { dispatch({ type: 'SET_DRAW', payload: data }) })

    // Dark mode media query
    if (options.hasAutoMode) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleColorSchemeMQ)
    }

    // Ready for map
    if (!activePanel) {
      dispatch({ type: 'CONTAINER_READY' })
    }

    return () => {
      window.removeEventListener('change', handleColorSchemeMQ)
    }
  }, [])

  // Toggle inert elements
  useEffect(() => {
    updateTitle()
    toggleInert(activeRef.current)
    activeRef.current?.focus()
  }, [isPage, activePanel])

  return (
    <ViewportProvider options={options}>
      <div
        className={`fm-o-container${isDarkMode ? ' fm-o-container--dark' : ''} fm-${device} ${type}${isQueryMode ? ' fm-draw' : ''}`}
        {...{ onKeyDown: constrainFocus }} style={{ height, width: '100%' }}
        {...(isPage ? { 'data-fm-page': options.pageTitle || 'Map view' } : {})}
        data-fm-container=''
      >
        {isLegendFixed && (
          <div className='fm-o-side'>
            {!isQueryMode && isPage && <Exit />}
            {!isQueryMode
              ? (
                <Panel className='legend' label={legend.title} width={legend.width} isFixed={isLegendFixed} isHideHeading={!hasLengedHeading}>
                  {queryPolygon && (
                    <div className='fm-c-menu'>
                      <Draw />
                    </div>
                  )}
                  {hasSegments && <Segments />}
                  {hasLayers && <Layers hasSymbols={!!legend.display} hasInputs />}
                </Panel>
                )
              : (
                <Panel className='help' label={queryPolygon.helpLabel} width={legend.width} html={queryPolygon.html} isModal />
                )}
          </div>
        )}
        <div className='fm-o-main'>
          <Viewport />
          <div className={`fm-o-inner${isLegendInset ? ' fm-o-inner--inset' : ''}${isOffset ? ' fm-o-inner--offset-top' : ''}`}>
            <div className='fm-o-top'>
              <div className='fm-o-top__column'>
                {hasExitButton && <Exit />}
                {!isMobile && hasSearchButton && (
                  <SearchButton searchBtnRef={searchBtnRef} />
                )}
                {!isMobile && hasSearchPanel && <Search instigatorRef={searchBtnRef} />}
                {hasLegendButton && <LegendButton legendBtnRef={legendBtnRef} />}
                {hasKeyButton && <KeyButton keyBtnRef={keyBtnRef} />}
                {hasHelpButton && <HelpButton helpBtnRef={helpBtnRef} label={queryPolygon.helpLabel} />}
                {activePanel === 'KEY' && !isMobile && (
                  <Panel isNotObscure={false} className='key' label='Key' width={legend.keyWidth || legend.width} instigatorRef={keyBtnRef} isModal={isKeyExpanded} isInset>
                    {hasLayers && <Layers hasInputs={false} hasSymbols />}
                  </Panel>
                )}
                {activePanel === 'INFO' && info && !isMobile && (
                  <Panel className='info' label={info.label} width={info.width} html={info.html} instigatorRef={viewportRef} isModal={false} isInset isNotObscure />
                )}
                {activePanel === 'LEGEND' && !isMobile && isLegendInset && (
                  <Panel className='legend' isNotObscure={false} label={legend.title} width={legend.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                    {queryPolygon && (
                      <div className='fm-c-menu'>
                        <Draw />
                      </div>
                    )}
                    {hasSegments && <Segments />}
                    {hasLayers && <Layers hasSymbols={!!legend.display} hasInputs />}
                  </Panel>
                )}
              </div>
              <div className='fm-o-top__column'>
                <ViewportLabel />
                {isQueryMode && <DrawEdit />}
              </div>
              <div className='fm-o-top__column'>
                {isMobile && hasSearchButton && (
                  <SearchButton searchBtnRef={searchBtnRef} tooltip='left' />
                )}
                {isMobile && hasSearchPanel && <Search instigatorRef={searchBtnRef} />}
                {!(isMobile && hasSearchPanel) && (
                  <>
                    {provider.basemaps && !!Object.keys(provider?.basemaps).length && <StylesButton stylesBtnRef={stylesBtnRef} />}
                    {options.hasReset && <Reset />}
                    {options.hasGeoLocation && !isQueryMode && <Location provider={provider} />}
                    {!isMobile && <Zoom />}
                  </>
                )}
              </div>
            </div>
            <div className='fm-o-middle'>
              {activePanel === 'LEGEND' && !isLegendInset && (
                <Panel className='legend' isNotObscure={false} label={legend.title} width={legend.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                  {queryPolygon && (
                    <div className='fm-c-menu'>
                      <Draw />
                    </div>
                  )}
                  {hasSegments && <Segments />}
                  {hasLayers && <Layers hasSymbols={!!legend.display} hasInputs />}
                </Panel>
              )}
              {activePanel === 'HELP' && !isLegendFixed && (
                <Panel className='help' label={queryPolygon.helpLabel} width={legend.width} instigatorRef={helpBtnRef} html={queryPolygon.html} isModal />
              )}
              {activePanel === 'STYLE' && (
                <Panel className='style' label='Map style' instigatorRef={stylesBtnRef} width='400px' isInset={!isMobile} isModal>
                  <Styles />
                </Panel>
              )}
              {activePanel === 'KEYBOARD' && (
                <Panel className='keyboard' width='500px' maxWidth='500px' label='Keyboard' instigatorRef={viewportRef} isModal isInset>
                  <Keyboard />
                </Panel>
              )}
              {activePanel === 'ERROR' && (
                <Panel maxWidth='300px' label={error.label} instigatorRef={viewportRef} isModal isInset>
                  <MapError />
                </Panel>
              )}
            </div>
            <div className='fm-o-bottom'>
              <div className='fm-o-footer'>
                <div className='fm-o-logo'>
                  <Logo />
                </div>
                {isQueryMode && !isMobile && (
                  <div className='fm-o-actions'>
                    <DrawFinish />
                  </div>
                )}
                {hasQueryButton && !isMobile && (
                  <div className='fm-o-actions'>
                    <PolygonQueryButton />
                  </div>
                )}
                <div className='fm-o-scale' />
              </div>
              {info && activePanel === 'INFO' && isMobile && (
                <Panel className='info' label={info.label} html={info.html} instigatorRef={viewportRef} isModal={false} isInset isNotObscure />
              )}
              {activePanel === 'KEY' && isMobile && (
                <Panel className='key' label='Key' instigatorRef={keyBtnRef} isModal={isKeyExpanded} isInset isNotObscure>
                  {hasLayers && <Layers hasInputs={false} hasSymbols />}
                </Panel>
              )}
              {activePanel === 'LEGEND' && isMobile && isLegendInset && (
                <Panel className='legend' isNotObscure label={legend.title} width={legend.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isFixed={isLegendFixed} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                  {queryPolygon && (
                    <div className='fm-c-menu'>
                      <Draw />
                    </div>
                  )}
                  {hasSegments && <Segments />}
                  {hasLayers && <Layers hasSymbols hasInputs />}
                </Panel>
              )}
              {isQueryMode && isMobile && <DrawFinish />}
              {hasQueryButton && isMobile && <PolygonQueryButton />}
              <PixelQueryButton/>
            </div>
          </div>
        </div>
      </div>
    </ViewportProvider>
  )
}
