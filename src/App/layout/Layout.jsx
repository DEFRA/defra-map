import React, { useEffect } from 'react'
import { Viewport } from '../components/Viewport/Viewport'
import { useConfig } from '../store/configContext'
import { useApp } from '../store/appContext'
import { useMap } from '../store/mapContext'
import { useLayoutMeasurements } from '../hooks/useLayoutMeasurements'
import { useFocusVisible } from '../hooks/useFocusVisible'
import { Logo } from '../components/Logo/Logo'
import { Attributions } from '../components/Attributions/Attributions'
import { layoutSlots } from '../renderer/slots'
import { SlotRenderer } from '../renderer/SlotRenderer'

export const Layout = () => {
  const { id } = useConfig()
  const { breakpoint, interfaceType, preferredColorScheme, layoutRefs, isLayoutReady, hasExclusiveControl, isFullscreen } = useApp()
  const { mapStyle } = useMap()

  useLayoutMeasurements()
  useFocusVisible()

  return (
    <div
      id={`${id}-dm-app`}
      className={[
        'dm-o-app',
        `dm-o-app--${breakpoint}`,
        `dm-o-app--${interfaceType}`,
        `dm-o-app--${isFullscreen ? 'fullscreen' : 'inline'}`,
        `dm-o-app--${mapStyle?.appColorScheme || preferredColorScheme}-app`,
        `dm-o-app--${mapStyle?.mapColorScheme || 'light'}-map`,
        hasExclusiveControl && 'dm-o-app--exclusive-control'
      ].filter(Boolean).join(' ')}
      style={{ backgroundColor: mapStyle?.backgroundColor || undefined }}
      ref={layoutRefs.appContainerRef}
    >
      <Viewport keyboardHintPortalRef={layoutRefs.topRef} />
      <div className={`dm-o-app__overlay${!isLayoutReady ? ' dm-o-app__overlay--not-ready' : ''}`}>
        <div className='dm-o-app__side' ref={layoutRefs.sideRef}>
          <SlotRenderer slot={layoutSlots.SIDE} />
        </div>
        <div className='dm-o-app__main' ref={layoutRefs.mainRef}>
          <div className='dm-o-app__banner' ref={layoutRefs.bannerRef}>
            <SlotRenderer slot={layoutSlots.BANNER} />
          </div>
          <div className='dm-o-app__top' ref={layoutRefs.topRef}>
            <div className='dm-o-app__top-col' ref={layoutRefs.topLeftColRef}>
              <SlotRenderer slot={layoutSlots.TOP_LEFT} />
            </div>
            <div className='dm-o-app__top-col'>
              <SlotRenderer slot={layoutSlots.TOP_MIDDLE} />
            </div>
            <div className='dm-o-app__top-col' ref={layoutRefs.topRightColRef}>
              <SlotRenderer slot={layoutSlots.TOP_RIGHT} />
            </div>
          </div>
          <div className='dm-o-app__inset' ref={layoutRefs.insetRef}>
            <SlotRenderer slot={layoutSlots.INSET} />
          </div>
          <div className='dm-o-app__right' ref={layoutRefs.rightRef}>
            <div className='dm-o-app__right-top'>
              <SlotRenderer slot={layoutSlots.RIGHT_TOP} />
            </div>
            <div className='dm-o-app__right-bottom'>
              <SlotRenderer slot={layoutSlots.RIGHT_BOTTOM} />
            </div>
          </div>
          <div className='dm-o-app__middle'>
            <SlotRenderer slot={layoutSlots.MIDDLE} />
          </div>
          <div className='dm-o-app__footer' ref={layoutRefs.footerRef}>
            <div className='dm-o-app__footer-col'>
              <Logo />
            </div>
            <div className='dm-o-app__footer-col'>
              <SlotRenderer slot={layoutSlots.FOOTER_RIGHT} />
              <div className='dm-o-app__attributions'>
                <Attributions />
              </div>
            </div>
          </div>
          <div className='dm-o-app__bottom'>
            <SlotRenderer slot={layoutSlots.BOTTOM} />
          </div>
          <div className='dm-o-app__actions' ref={layoutRefs.actionsRef}>
            <SlotRenderer slot={layoutSlots.ACTIONS} />
          </div>
        </div>
        <div className='dm-o-app__drawer' ref={layoutRefs.drawerRef}>
          <SlotRenderer slot={layoutSlots.DRAWER} />
        </div>
      </div>
      <div className='dm-o-app__modal'>
        <SlotRenderer slot={layoutSlots.MODAL} />
        <div className='dm-o-app__modal-backdrop' />
      </div>
    </div>
  )
}
