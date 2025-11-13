import React from 'react'
import { render } from '@testing-library/react'
import { App } from './App.jsx'
import { AppProvider } from '../store/AppProvider.jsx'
import { MapProvider } from '../store/MapProvider.jsx'
import { ServiceProvider } from '../store/ServiceProvider.jsx'
import { PluginProvider } from '../store/PluginProvider.jsx'
import { removeLoadingState } from '../../api/domStateManager.js'
import eventBus from '../../services/eventBus.js'

// Mock all components and dependencies
jest.mock('../store/AppProvider.jsx', () => ({
  AppProvider: jest.fn(({ children, options }) => <div data-testid='app-provider' data-options={JSON.stringify(options)}>{children}</div>)
}))
jest.mock('../store/MapProvider.jsx', () => ({
  MapProvider: jest.fn(({ children, options }) => <div data-testid='map-provider' data-options={JSON.stringify(options)}>{children}</div>)
}))
jest.mock('../store/ServiceProvider.jsx', () => ({
  ServiceProvider: jest.fn(({ children }) => <div data-testid='service-provider'>{children}</div>)
}))
jest.mock('../store/PluginProvider.jsx', () => ({
  PluginProvider: jest.fn(({ children }) => <div data-testid='plugin-provider'>{children}</div>)
}))
jest.mock('../renderer/PluginInits.jsx', () => ({
  PluginInits: jest.fn(() => <div data-testid='plugin-inits' />)
}))
jest.mock('../layout/Layout.jsx', () => ({
  Layout: jest.fn(() => <div data-testid='layout' />)
}))
jest.mock('../../api/domStateManager.js', () => ({
  removeLoadingState: jest.fn()
}))
jest.mock('../../services/eventBus.js', () => ({
  emit: jest.fn()
}))

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders with correct component hierarchy and props', () => {
    const props = { mapProvider: 'test', extraProp: 'value' }

    const { getByTestId } = render(<App {...props} />)

    // Verify all components are rendered
    expect(getByTestId('app-provider')).toBeInTheDocument()
    expect(getByTestId('map-provider')).toBeInTheDocument()
    expect(getByTestId('service-provider')).toBeInTheDocument()
    expect(getByTestId('plugin-provider')).toBeInTheDocument()
    expect(getByTestId('plugin-inits')).toBeInTheDocument()
    expect(getByTestId('layout')).toBeInTheDocument()

    // Verify props are passed correctly to providers
    expect(JSON.parse(getByTestId('app-provider').dataset.options)).toEqual(props)
    expect(JSON.parse(getByTestId('map-provider').dataset.options)).toEqual(props)
  })

  test('calls removeLoadingState and emits app:ready on mount', () => {
    render(<App />)

    expect(removeLoadingState).toHaveBeenCalledTimes(1)
    expect(eventBus.emit).toHaveBeenCalledWith('app:ready')
    expect(eventBus.emit).toHaveBeenCalledTimes(1)
  })

  test('useEffect runs only once', () => {
    const { rerender } = render(<App />)

    // Rerender with different props
    rerender(<App newProp='test' />)

    // Should still only be called once due to empty dependency array
    expect(removeLoadingState).toHaveBeenCalledTimes(1)
    expect(eventBus.emit).toHaveBeenCalledTimes(1)
  })

  test('providers are called with correct props', () => {
    const testProps = { mapFramework: 'leaflet', config: { zoom: 10 } }

    render(<App {...testProps} />)

    // Verify providers were called
    expect(AppProvider).toHaveBeenCalledTimes(1)
    expect(MapProvider).toHaveBeenCalledTimes(1)
    expect(ServiceProvider).toHaveBeenCalledTimes(1)
    expect(PluginProvider).toHaveBeenCalledTimes(1)

    // Verify AppProvider and MapProvider received the options prop
    const appProviderCall = AppProvider.mock.calls[0][0]
    const mapProviderCall = MapProvider.mock.calls[0][0]

    expect(appProviderCall.options).toEqual(testProps)
    expect(mapProviderCall.options).toEqual(testProps)
    expect(appProviderCall.children).toBeDefined()
    expect(mapProviderCall.children).toBeDefined()
  })
})
