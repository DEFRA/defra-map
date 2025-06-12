import React, { useEffect, useRef } from 'react'
import { ViewportProvider } from '../store/viewport-provider.jsx'
import { useApp } from '../store/use-app'
import { defaults, labels, events, settings } from '../store/constants'
import { updateTitle, toggleInert } from '../lib/dom'
import eventBus from '../lib/eventbus'
import Viewport from './viewport.jsx'
import Exit from './exit.jsx'
import Search from './search.jsx'
import Panel from './panel.jsx'
import Segments from './segments.jsx'
import Layers from './layers.jsx'
import Logo from './logo.jsx'
import DrawMenu from './draw-menu.jsx'
import DrawAction from './draw-action.jsx'
import Styles from './styles.jsx'
import Keyboard from './keyboard.jsx'
import LegendButton from './legend-button.jsx'
import KeyButton from './key-button.jsx'
import SearchButton from './search-button.jsx'
import StylesButton from './styles-button.jsx'
import Zoom from './zoom.jsx'
import Reset from './reset.jsx'
import Location from './location.jsx'
import MapError from './map-error.jsx'
import ViewportLabel from './viewport-label.jsx'
import Actions from './actions.jsx'
import EditButton from './edit-button.jsx'
import HelpButton from './help-button.jsx'
import Attribution from './attribution.jsx'
import Banner from './banner.jsx'
import DrawConstraint from './draw-constraint.jsx'
import ScaleBar from './scale-bar.jsx'
import Inspector from './inspector.jsx'

const getClassNames = (isDarkMode, device, behaviour, isDrawMode) => {
  return `fm-o-container${isDarkMode ? ' fm-o-container--dark' : ''} fm-${device} ${behaviour}${isDrawMode ? ' fm-draw' : ''}`
}

export default function Container () {
  // Derived from state and props
  const { dispatch, provider, options, parent, info, search, drawMode, activePanel, previousPanel, isPage, isMobile, isDesktop, interfaceType, isDarkMode, isKeyExpanded, activeRef, viewportRef, hash, error } = useApp()
  const legend = options.legend

  // Refs to elements
  const legendBtnRef = useRef(null)
  const keyBtnRef = useRef(null)
  const searchBtnRef = useRef(null)
  const stylesBtnRef = useRef(null)
  const editBtnRef = useRef(null)

  // Template properties
  const device = (isMobile && 'mobile') || (isDesktop && 'desktop') || 'tablet'
  const behaviour = settings.container[options.behaviour || defaults.CONTAINER_TYPE].CLASS
  const height = (isPage || options.container) ? '100%' : options.height || settings.container[options.behaviour]?.HEIGHT
  const isCombined = ['compact', 'inset'].includes(legend?.display)
  const isFixed = legend && isDesktop && !isCombined
  const isLegendInset = legend?.display === 'inset'
  const isLegendModal = !isFixed && (!isLegendInset || (isLegendInset && isKeyExpanded))
  const hasLengedHeading = !(legend?.display === 'inset' && legend?.segments?.[0]?.display === 'timeline')
  const isDrawMode = ['frame', 'vertex'].includes(drawMode)
  const hasButtons = !(isMobile && (activePanel === 'SEARCH' || (isDesktop && search?.isExpanded)))
  const srid = provider?.srid
  const hasSizeCapability = provider?.capabilities?.hasSize
  const hasInspector = activePanel === 'INSPECTOR' || (activePanel === 'STYLE' && previousPanel === 'INSPECTOR')
  const combindedTitle = isCombined && (legend?.title ? `<span class="fm-u-visually-hidden">${labels.legend.TITLE}:</span> ${legend?.title}` : labels.legend.TITLE)
  const seperateTitle = options.draw?.heading ? labels.menu.TITLE : labels.layers.TITLE
  const legendTitle = combindedTitle || seperateTitle

  const handleColorSchemeMQ = () => dispatch({
    type: 'SET_IS_DARK_MODE',
    payload: { colourScheme: window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }
  })

  // Communication between Vanilla JS and React components
  useEffect(() => {
    eventBus.on(parent, events.SET_INFO, data => { dispatch({ type: 'SET_INFO', payload: data }) })
    eventBus.on(parent, events.SET_SELECTED, data => { dispatch({ type: 'SET_SELECTED', payload: { featureId: data } }) })
    eventBus.on(parent, events.SET_BANNER, data => { dispatch({ type: 'SET_BANNER', payload: data }) })

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
    activeRef.current?.focus({ preventScroll: true })
  }, [isPage, activePanel, hash])

  return (
    <ViewportProvider options={{ ...options, srid, hasSizeCapability}}>
      <div
        className={getClassNames(isDarkMode, device, behaviour, isDrawMode)}
        style={{ height }}
        {...(isPage ? { 'data-fm-page': options.pageTitle || 'Map view' } : {})}
        data-fm-container=''
      >
        <p className='fm-u-visually-hidden'>
          This page contains a map. To interact with the map, press Tab until it recieves focus.
          Once focused, you can use the keyboard command Alt + K to display all available commands.
          Ensure the map has focus before using the keyboard commands.
        </p>
        <div className='fm-o-side'>
          {isFixed && (<Exit />)}
          {isDesktop && isDrawMode && (hasInspector || isFixed) && (
            <Panel className='edit' label='Dimensions' {...!isFixed ? { instigatorRef: editBtnRef } : {}} width={legend?.width}>
              <Inspector />
            </Panel>
          )}
          {isFixed && !isDrawMode && (
            <Panel className='legend' label={legendTitle} width={legend?.width} isHideHeading={!hasLengedHeading}>
              <DrawMenu />
              <Segments />
              <Layers hasSymbols={!!legend?.display} hasInputs />
            </Panel>
          )}
        </div>
        <div className='fm-o-main' data-fm-main>
          <Viewport />
          <div className={`fm-o-overlay${isLegendInset ? ' fm-o-overlay--inset' : ''}`}>
            <div className='fm-o-banner'>
              <Banner />
              {isMobile && isDrawMode && <DrawConstraint />}
            </div>
            <div className='fm-o-top'>
              <div className='fm-o-top__column'>
                <Exit />
                {!isMobile && (
                  <>
                    <SearchButton searchBtnRef={searchBtnRef} />
                    <Search instigatorRef={searchBtnRef} />
                  </>
                )}
                <LegendButton legendBtnRef={legendBtnRef} />
                <KeyButton keyBtnRef={keyBtnRef} />
                {activePanel === 'KEY' && !isMobile && (
                  <Panel isNotObscure={false} className='key' label={labels.legend.TITLE} width={legend?.keyWidth || legend?.width} instigatorRef={keyBtnRef} isModal={isKeyExpanded} isInset>
                    <Layers hasInputs={false} hasSymbols />
                  </Panel>
                )}
                {activePanel === 'INFO' && info && !isMobile && (
                  <Panel className='info' link={info.link} label={info.label} width={info.width} html={info.html} instigatorRef={viewportRef} isModal={false} isInset isNotObscure />
                )}
                {activePanel === 'LEGEND' && !isMobile && isLegendInset && (
                  <Panel className='legend' isNotObscure={false} label={legendTitle} width={legend?.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                    <DrawMenu />
                    <Segments />
                    <Layers hasSymbols={!!legend?.display} hasInputs />
                  </Panel>
                )}
              </div>
              <div className='fm-o-top__column'>
                {!isMobile && isDrawMode && <DrawConstraint />}
                <ViewportLabel />
              </div>
              <div className='fm-o-top__column'>
                {!isMobile && activePanel === 'STYLE' && (
                  <Panel className='style' label='Map style' instigatorRef={stylesBtnRef} width='400px' isInset={!isMobile} isModal>
                    <Styles />
                  </Panel>
                )}
                <HelpButton />
                {isMobile && (
                  <>
                    <SearchButton searchBtnRef={searchBtnRef} tooltip='left' />
                    <Search instigatorRef={searchBtnRef} />
                  </>
                )}
                {hasButtons && (
                  <>
                    <StylesButton stylesBtnRef={stylesBtnRef} />
                    <Reset />
                    <Location provider={provider} />
                    <Zoom />
                  </>
                )}
              </div>
            </div>
            <div className='fm-o-middle'>
              {activePanel === 'LEGEND' && !isFixed && !isLegendInset && (
                <Panel className='legend' isNotObscure={false} label={legendTitle} width={legend?.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                  <DrawMenu />
                  <Segments />
                  <Layers hasSymbols={!!legend?.display} hasInputs />
                </Panel>
              )}
              {activePanel === 'INSPECTOR' && !isMobile && !isDesktop && (
                <Panel className='edit' label='Dimensions' instigatorRef={editBtnRef} width={legend?.width} isModal>
                  <Inspector />
                </Panel>
              )}
              {activePanel === 'KEYBOARD' && (
                <Panel className='keyboard' width='560px' maxWidth='560px' label='Keyboard' instigatorRef={viewportRef} isModal isInset>
                  <Keyboard />
                </Panel>
              )}
              {activePanel === 'ERROR' && (
                <Panel className='error' maxWidth='300px' label={error.label} instigatorRef={viewportRef} isModal isInset>
                  <MapError />
                </Panel>
              )}
            </div>
            <div className='fm-o-bottom'>
              <div className='fm-o-logo'>
                <Logo />
              </div>
              {!isMobile && <Actions />}
              <div className='fm-o-tools'>
                <EditButton editBtnRef={editBtnRef} />
                <DrawAction />
                <ScaleBar />
              </div>
              {info && activePanel === 'INFO' && isMobile && (
                <Panel className='info' link={info.link} label={info.label} html={info.html} instigatorRef={viewportRef} isModal={false} isInset isNotObscure />
              )}
              {activePanel === 'KEY' && isMobile && (
                <Panel className='key' label={labels.legend.TITLE} instigatorRef={keyBtnRef} isModal={isKeyExpanded} isInset isNotObscure>
                  <Layers hasInputs={false} hasSymbols />
                </Panel>
              )}
              {activePanel === 'LEGEND' && isMobile && isLegendInset && (
                <Panel className='legend' isNotObscure label={legendTitle} width={legend?.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                  <DrawMenu />
                  <Segments />
                  <Layers hasSymbols hasInputs />
                </Panel>
              )}
              {isMobile && !hasInspector && <Actions />}
            </div>
            <Attribution />
          </div>
        </div>
        <div className='fm-o-side'>
          {isMobile && hasInspector && (
            <Panel className='edit' label='Dimensions' instigatorRef={editBtnRef} width={legend?.width}>
              <Inspector />
            </Panel>
          )}
        </div>
        {isMobile && activePanel === 'STYLE' && (
          <Panel className='style' label='Map style' instigatorRef={stylesBtnRef} width='400px' isInset={!isMobile} isModal>
            <Styles />
          </Panel>
        )}
      </div>
    </ViewportProvider>
  )
}
