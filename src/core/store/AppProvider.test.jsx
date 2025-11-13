import React from 'react'
import { render, act } from '@testing-library/react'
import { AppProvider, AppContext } from './AppProvider.jsx'
import * as panelRegistry from '../registry/panelRegistry.js'
import * as buttonRegistry from '../registry/buttonRegistry.js'
import * as mediaHook from '../hooks/useMediaQueryDispatch.js'
import * as detectBreakpoint from '../../utils/detectBreakpoint.js'
import * as detectInterface from '../../utils/detectInterfaceType.js'
import eventBus from '../../services/eventBus.js'

jest.mock('../registry/panelRegistry.js')
jest.mock('../registry/buttonRegistry.js')
jest.mock('../hooks/useMediaQueryDispatch.js')
jest.mock('../../utils/detectBreakpoint.js')
jest.mock('../../utils/detectInterfaceType.js')
jest.mock('../../services/eventBus.js')

describe('AppProvider', () => {
  let handleBreakpointChange, handleInterfaceChange
  let capturedSetMode, capturedRevertMode

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }))
    })
  })

  beforeEach(() => {
    panelRegistry.getPanelConfig.mockReturnValue({ panel1: {} })
    buttonRegistry.getButtonConfig.mockReturnValue({ save: { label: 'Save' } })
    mediaHook.useMediaQueryDispatch.mockImplementation(() => {})

    handleBreakpointChange = jest.fn()
    handleInterfaceChange = jest.fn()
    detectBreakpoint.subscribeToBreakpointChange.mockImplementation(() => handleBreakpointChange)
    detectInterface.subscribeToInterfaceChanges.mockImplementation(() => handleInterfaceChange)

    capturedSetMode = null
    capturedRevertMode = null
    eventBus.on = jest.fn((event, handler) => {
      if (event === 'app:setmode') capturedSetMode = handler
      if (event === 'app:revertmode') capturedRevertMode = handler
    })
    eventBus.off = jest.fn()
  })

  test('renders children and calls config hooks', () => {
    const { getByText } = render(
      <AppProvider options={{ testOption: true }}>
        <div>ChildContent</div>
      </AppProvider>
    )
    expect(getByText('ChildContent')).toBeInTheDocument()
    expect(panelRegistry.getPanelConfig).toHaveBeenCalled()
    expect(buttonRegistry.getButtonConfig).toHaveBeenCalled()
    expect(mediaHook.useMediaQueryDispatch).toHaveBeenCalled()
  })

  test('handles breakpoint and interface callbacks', () => {
    let breakpointCb, interfaceCb
    detectBreakpoint.subscribeToBreakpointChange.mockImplementation(cb => { breakpointCb = cb; return jest.fn() })
    detectInterface.subscribeToInterfaceChanges.mockImplementation(cb => { interfaceCb = cb; return jest.fn() })

    render(<AppProvider options={{}}><div>Child</div></AppProvider>)

    act(() => {
      breakpointCb('sm') // line 41
      interfaceCb('mobile') // line 45
    })
  })

  test('handles eventBus setmode and revertmode', () => {
    render(<AppProvider options={{}}><div>Child</div></AppProvider>)
    act(() => {
      capturedSetMode('newMode') // line 49
      capturedRevertMode() // line 53
    })
    act(() => {
      eventBus.off('app:setmode', capturedSetMode)
      eventBus.off('app:revertmode', capturedRevertMode)
    })
  })

  test('provides state, dispatch, and layoutRefs via context', () => {
    let contextValue
    render(
      <AppProvider options={{}}>
        <AppContext.Consumer>
          {value => { contextValue = value; return null }}
        </AppContext.Consumer>
      </AppProvider>
    )

    expect(contextValue).toHaveProperty('dispatch')
    expect(contextValue).toHaveProperty('mode')
    expect(contextValue).toHaveProperty('openPanels')
    expect(contextValue.layoutRefs).toHaveProperty('mainRef')
    expect(contextValue.layoutRefs).toHaveProperty('bottomRef')
    expect(contextValue.layoutRefs).toHaveProperty('drawerRef')
  })
})
