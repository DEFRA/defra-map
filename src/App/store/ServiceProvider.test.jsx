import React from 'react'
import { renderHook } from '@testing-library/react'
import { ServiceProvider, ServiceContext } from './ServiceProvider.jsx'

import { createAnnouncer } from '../../services/announcer.js'
import { reverseGeocode } from '../../services/reverseGeocode.js'
import eventBus from '../../services/eventBus.js'
import { closeApp } from '../../services/closeApp.js'

// Mock external dependencies
jest.mock('../../services/announcer.js', () => ({
  createAnnouncer: jest.fn(() => jest.fn())
}))
jest.mock('../../services/reverseGeocode.js', () => ({
  reverseGeocode: jest.fn(() => 'mockedReverseGeocode')
}))
jest.mock('../../services/eventBus.js', () => ({
  publish: jest.fn(),
  subscribe: jest.fn()
}))
jest.mock('../../services/closeApp.js', () => ({
  closeApp: jest.fn()
}))

// Mock useConfig hook
jest.mock('../store/configContext.js', () => ({
  useConfig: jest.fn(() => ({
    handleExitClick: jest.fn()
  }))
}))

describe('ServiceProvider', () => {
  test('provides announce, reverseGeocode, eventBus, and closeApp via context', () => {
    const wrapper = ({ children }) => <ServiceProvider>{children}</ServiceProvider>

    const { result } = renderHook(() => React.useContext(ServiceContext), { wrapper })

    // Announce comes from createAnnouncer(mapStatusRef)
    expect(createAnnouncer).toHaveBeenCalledTimes(1)
    expect(typeof result.current.announce).toBe('function')

    // reverseGeocode is passed through and callable
    const output = result.current.reverseGeocode(10, { lat: 1, lng: 2 })
    expect(reverseGeocode).toHaveBeenCalledWith(10, { lat: 1, lng: 2 })
    expect(output).toBe('mockedReverseGeocode')

    // eventBus is injected directly
    expect(result.current.eventBus).toBe(eventBus)

    // closeApp is available
    expect(typeof result.current.closeApp).toBe('function')

    // mapStatusRef is available
    expect(result.current.mapStatusRef).toBeDefined()
    expect(result.current.mapStatusRef.current).toBeNull()
  })

  test('renders children', () => {
    const wrapper = ({ children }) => <ServiceProvider>{children}</ServiceProvider>

    const { result } = renderHook(() => React.useContext(ServiceContext), {
      wrapper,
      initialProps: { children: <span>child</span> }
    })

    // context is still defined, children rendered fine
    expect(result.current).toBeTruthy()
  })

  test('closeApp calls closeApp service with handleExitClick', () => {
    const mockHandleExitClick = jest.fn()
    const { useConfig } = require('../store/configContext.js')
    useConfig.mockReturnValue({ handleExitClick: mockHandleExitClick })

    const wrapper = ({ children }) => <ServiceProvider>{children}</ServiceProvider>
    const { result } = renderHook(() => React.useContext(ServiceContext), { wrapper })

    result.current.closeApp()

    expect(closeApp).toHaveBeenCalledWith(mockHandleExitClick)
  })
})