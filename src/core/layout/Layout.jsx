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
      id={`${id}-am-app`}
      className={[
        'am-o-app',
        `am-o-app--${breakpoint}`,
        `am-o-app--${interfaceType}`,
        `am-o-app--${isFullscreen ? 'fullscreen' : 'inline'}`,
        `am-o-app--${mapStyle?.appColorScheme || preferredColorScheme}-app`,
        `am-o-app--${mapStyle?.mapColorScheme || 'light'}-map`,
        hasExclusiveControl && 'am-o-app--exclusive-control'
      ].filter(Boolean).join(' ')}
      style={{ backgroundColor: mapStyle?.backgroundColor || undefined }}
      ref={layoutRefs.appContainerRef}
    >
      <Viewport keyboardHintPortalRef={layoutRefs.topRef} />
      <div className={`am-o-app__overlay${!isLayoutReady ? ' am-o-app__overlay--not-ready' : ''}`}>
        <div className='am-o-app__side' ref={layoutRefs.sideRef}>
          <SlotRenderer slot={layoutSlots.SIDE} />
        </div>
        <div className='am-o-app__main' ref={layoutRefs.mainRef}>
          <div className='am-o-app__banner' ref={layoutRefs.bannerRef}>
            <SlotRenderer slot={layoutSlots.BANNER} />
          </div>
          <div className='am-o-app__top' ref={layoutRefs.topRef}>
            <div className='am-o-app__top-col' ref={layoutRefs.topLeftColRef}>
              <SlotRenderer slot={layoutSlots.TOP_LEFT} />
            </div>
            <div className='am-o-app__top-col'>
              <SlotRenderer slot={layoutSlots.TOP_MIDDLE} />
            </div>
            <div className='am-o-app__top-col' ref={layoutRefs.topRightColRef}>
              <SlotRenderer slot={layoutSlots.TOP_RIGHT} />
            </div>
          </div>
          <div className='am-o-app__inset' ref={layoutRefs.insetRef}>
            <SlotRenderer slot={layoutSlots.INSET} />
          </div>
          <div className='am-o-app__right' ref={layoutRefs.rightRef}>
            <div className='am-o-app__right-top'>
              <SlotRenderer slot={layoutSlots.RIGHT_TOP} />
            </div>
            <div className='am-o-app__right-bottom'>
              <SlotRenderer slot={layoutSlots.RIGHT_BOTTOM} />
            </div>
          </div>
          <div className='am-o-app__middle'>
            <SlotRenderer slot={layoutSlots.MIDDLE} />
          </div>
          <div className='am-o-app__bottom' ref={layoutRefs.bottomRef}>
            <div className='am-o-app__bottom-col'>
              <Logo />
            </div>
            <div className='am-o-app__bottom-col'>
              <SlotRenderer slot={layoutSlots.BOTTOM_RIGHT} />
              <div className='am-o-app__attributions'>
                <Attributions />
              </div>
            </div>
          </div>
          <div className='am-o-app__actions' ref={layoutRefs.actionsRef}>
            <SlotRenderer slot={layoutSlots.ACTIONS} />
          </div>
        </div>
        <div className='am-o-app__drawer' ref={layoutRefs.drawerRef}>
          <SlotRenderer slot={layoutSlots.DRAWER} />
        </div>
      </div>
      <div className='am-o-app__modal'>
        <SlotRenderer slot={layoutSlots.MODAL} />
        <div className='am-o-app__modal-backdrop' />
      </div>
    </div>
  )
}
