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
import Logo from './logo.jsx'
import Draw from './draw.jsx'
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
import HelpButton from './help-button.jsx'
import Attribution from './attribution.jsx'
import EditButton from './edit-button.jsx'
import Inspector from './inspector.jsx'
import WarningPanel from './warningPanel.jsx'

const getClassNames = (isDarkMode, device, behaviour, isQueryMode) => {
  return `fm-o-container${isDarkMode ? ' fm-o-container--dark' : ''} fm-${device} ${behaviour}${isQueryMode ? ' fm-draw' : ''}`
}

export default function Container () {
  // Derived from state and props
  const { dispatch, provider, options, parent, info, search, queryArea, mode, activePanel, previousPanel, isPage, isMobile, isDesktop, isDarkMode, isKeyExpanded, activeRef, viewportRef, hash, error, warningPosition } = useApp()

  // Refs to elements
  const legendBtnRef = useRef(null)
  const keyBtnRef = useRef(null)
  const searchBtnRef = useRef(null)
  const stylesBtnRef = useRef(null)
  const editBtnRef = useRef(null)

  // Template properties
  const device = (isMobile && 'mobile') || (isDesktop && 'desktop') || 'tablet'
  const behaviour = settings.container[options.behaviour || defaults.CONTAINER_TYPE].CLASS
  const height = (isPage || options.container) ? '100%' : options.height || settings.container[options.behaviour].HEIGHT
  const legend = options.legend
  const isLegendInset = legend?.display === 'inset'
  const isLegendFixed = isDesktop && !isLegendInset
  const isLegendModal = !isLegendFixed && (!isLegendInset || (isLegendInset && isKeyExpanded))
  const hasLengedHeading = !(legend.display === 'inset' || (isLegendFixed && isPage))
  const isQueryMode = ['frame', 'vertex'].includes(mode)
  const hasButtons = !(isMobile && (activePanel === 'SEARCH' || (isDesktop && search?.isExpanded)))
  const hasInspector = activePanel === 'INSPECTOR' || (activePanel === 'STYLE' && previousPanel === 'INSPECTOR')

  const handleColorSchemeMQ = () => dispatch({
    type: 'SET_IS_DARK_MODE',
    payload: { colourScheme: window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }
  })

  // Communication between Vanilla JS and React components
  useEffect(() => {
    eventBus.on(parent, events.SET_INFO, data => { dispatch({ type: 'SET_INFO', payload: data }) })
    eventBus.on(parent, events.SET_SELECTED, data => { dispatch({ type: 'SET_SELECTED', payload: { featureId: data } }) })

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
    <ViewportProvider options={options}>
      <div
        className={getClassNames(isDarkMode, device, behaviour, isQueryMode)}
        onKeyDown={constrainFocus}
        style={{ height }}
        {...(isPage ? { 'data-fm-page': options.pageTitle || 'Map view' } : {})}
        data-fm-container=''
      >
        {isLegendFixed && (
          <div className='fm-o-side'>
            <Exit />
            {!isQueryMode && (
              <Panel className='legend' label={legend.title} width={legend.width} isFixed={isLegendFixed} isHideHeading={!hasLengedHeading}>
                {queryArea && <Draw />}
                <Segments />
                <Layers hasSymbols={!!legend.display} hasInputs />
              </Panel>
            )}
            {isDesktop && isQueryMode && (hasInspector || isLegendFixed) && (
              <Panel className='edit' label='Dimensions' {...!isLegendFixed ? { instigatorRef: editBtnRef } : {}} width={legend?.width}>
                <Inspector />
              </Panel>
            )}
          </div>
        )}
        <div className='fm-o-main' data-fm-main>
          <Viewport />
          <div className={`fm-o-inner${isLegendInset ? ' fm-o-inner--inset' : ''}`}>
            <div className='fm-o-warning'>
              {isMobile && warningPosition === 'top' && <WarningPanel />}
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
                  <Panel isNotObscure={false} className='key' label='Key' width={legend.keyWidth || legend.width} instigatorRef={keyBtnRef} isModal={isKeyExpanded} isInset>
                    <Layers hasInputs={false} hasSymbols />
                  </Panel>
                )}
                {activePanel === 'INFO' && info && !isMobile && (
                  <Panel className='info' label={info.label} width={info.width} html={info.html} instigatorRef={viewportRef} isModal={false} isInset isNotObscure />
                )}
                {activePanel === 'LEGEND' && !isMobile && isLegendInset && (
                  <Panel className='legend' isNotObscure={false} label={legend.title} width={legend.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                    {queryArea && <Draw/>}
                    <Segments />
                    <Layers hasSymbols={!!legend.display} hasInputs />
                  </Panel>
                )}
              </div>
              <div className='fm-o-top__column'>
                {!isMobile && warningPosition === 'top' && <WarningPanel />}
                <ViewportLabel />
              </div>
              <div className='fm-o-top__column'>
                {isMobile && (
                  <>
                    <SearchButton searchBtnRef={searchBtnRef} tooltip='left' />
                    <Search instigatorRef={searchBtnRef} />
                  </>
                )}
                {hasButtons && (
                  <>
                    <HelpButton />
                    <StylesButton stylesBtnRef={stylesBtnRef} />
                    <Reset />
                    <EditButton editBtnRef={editBtnRef} />
                    <Location provider={provider} />
                    <Zoom />
                  </>
                )}
              </div>
            </div>
            <div className='fm-o-middle'>
              {activePanel === 'LEGEND' && !isLegendFixed && !isLegendInset && (
                <Panel className='legend' isNotObscure={false} label={legend.title} width={legend.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                  {queryArea && <Draw />}
                  <Segments />
                  <Layers hasSymbols={!!legend.display} hasInputs />
                </Panel>
              )}
              {activePanel === 'INSPECTOR' && !isMobile && !isDesktop && (
                <Panel className='edit' label='Dimensions' instigatorRef={editBtnRef} width={legend?.width} isModal>
                  <Inspector />
                </Panel>
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
                <Panel className='error' maxWidth='300px' label={error.label} instigatorRef={viewportRef} isModal isInset>
                  <MapError />
                </Panel>
              )}
            </div>
            <div className='fm-o-bottom'>
              <div className='fm-o-warning'>
                {warningPosition === 'bottom' && <WarningPanel />}
              </div>
              <div className='fm-o-footer'>
                <div className='fm-o-logo'>
                  <Logo />
                </div>
                {!isMobile && <Actions />}
                <div className='fm-o-scale' />
              </div>
              {info && activePanel === 'INFO' && isMobile && (
                <Panel className='info' label={info.label} html={info.html} instigatorRef={viewportRef} isModal={false} isInset isNotObscure />
              )}
              {activePanel === 'KEY' && isMobile && (
                <Panel className='key' label='Key' instigatorRef={keyBtnRef} isModal={isKeyExpanded} isInset isNotObscure>
                  <Layers hasInputs={false} hasSymbols />
                </Panel>
              )}
              {activePanel === 'LEGEND' && isMobile && isLegendInset && (
                <Panel className='legend' isNotObscure label={legend.title} width={legend.width} instigatorRef={legendBtnRef} isInset={isLegendInset} isFixed={isLegendFixed} isModal={isLegendModal} isHideHeading={!hasLengedHeading}>
                  {queryArea && <Draw />}
                  <Segments />
                  <Layers hasSymbols hasInputs />
                </Panel>
              )}
              {isMobile && <Actions />}
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
      </div>
    </ViewportProvider>
  )
}
