// src/core/store/AppProvider.jsx
import React, { createContext, useRef, useEffect, useReducer, useMemo } from 'react'
import { initialState, reducer } from './appReducer.js'
import eventBus from '../../services/eventBus.js'
import { ConfigContext } from './configContext.js'
import { subscribeToBreakpointChange } from '../../utils/detectBreakpoint.js'
import { subscribeToInterfaceChanges } from '../../utils/detectInterfaceType.js'
import { useMediaQueryDispatch } from '../hooks/useMediaQueryDispatch.js'
import { getPanelConfig } from '../registry/panelRegistry.js'
import { getButtonConfig } from '../registry/buttonRegistry.js'

export const AppContext = createContext(null)

export const AppProvider = ({ options, children }) => {
  // Add refs for layout elements
  const layoutRefs = {
    appContainerRef: useRef(null),
    sideRef: useRef(null),
    mainRef: useRef(null),
    topRef: useRef(null),
    topLeftColRef: useRef(null),
    topRightColRef: useRef(null),
    insetRef: useRef(null),
    rightRef: useRef(null),
    footerRef: useRef(null),
    actionsRef: useRef(null),
    drawerRef: useRef(null),
    bannerRef: useRef(null),
    viewportRef: useRef(null)
  }

  // Add refs for button elements
  const buttonRefs = useRef({})

  const config = {
    ...options,
    buttonConfig: getButtonConfig(),
    panelConfig: getPanelConfig()
  }

  const [state, dispatch] = useReducer(reducer, initialState(config))

  useMediaQueryDispatch(dispatch, config)

  const handleBreakpointChange = subscribeToBreakpointChange((breakpoint) => {
    dispatch({ type: 'SET_BREAKPOINT', payload: { behaviour: config.behaviour, breakpoint }})
  })

  const handleInterfaceTypeChange = subscribeToInterfaceChanges((newType) => {
    dispatch({ type: 'SET_INTERFACE_TYPE', payload: newType })
  })

  const handleSetMode = (mode) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }

  const handleRevertMode = () => {
    dispatch({ type: 'REVERT_MODE' })
  }

  useEffect(() => {
    eventBus.on('app:setmode', handleSetMode)
    eventBus.on('app:revertmode', handleRevertMode)

    return () => {
      eventBus.off('app:setmode', handleSetMode)
      eventBus.off('app:revertmode', handleRevertMode)
      handleBreakpointChange()
      handleInterfaceTypeChange()
    }
  }, [])

  const appStore = useMemo(() => ({
    ...state,
    dispatch,
    layoutRefs,
    buttonRefs
  }), [state])

  return (
    <ConfigContext.Provider value={config}>
      <AppContext.Provider value={appStore}>
        {children}
      </AppContext.Provider>
    </ConfigContext.Provider>
  )
}
