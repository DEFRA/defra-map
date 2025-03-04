import React, { useContext } from 'react'
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppProvider, AppContext } from '../../src/js/store/app-provider'
import { ViewportProvider } from '../../src/js/store/viewport-provider'
import Viewport from '../../src/js/components/viewport'
import { debounce } from '../../src/js/lib/debounce'

jest.mock('../../src/js/lib/debounce', () => ({
  debounce: jest.fn((fn) => fn)
}))

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => {
    return {
      matches: true,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  })
})

global.PointerEvent = jest.fn((type, options) => {
  return {
    type,
    clientX: options.clientX || 0,
    clientY: options.clientY || 0,
    layerX: options.layerX || 0,
    layerY: options.layerY || 0,
    bubbles: options.bubbles || false,
    cancelable: options.cancelable || false
    // You can mock other properties as needed
  }
})

const AppContextProvider = ({ children, mockState }) => {
  const context = useContext(AppContext)
  return (
    <AppContext.Provider value={{ ...context, ...mockState }}>
      {children}
    </AppContext.Provider>
  )
}

describe('viewport', () => {
  let providerMock, appDispatchMock
  const eventHandlers = {}

  const parentElement = document.createElement('div')
  document.body.appendChild(parentElement)

  const queryFeature = jest.fn()
  const queryPoint = jest.fn()
  const zoomIn = jest.fn()
  const panBy = jest.fn()
  const showLabel = jest.fn()

  beforeEach(() => {
    appDispatchMock = jest.fn()
    providerMock = {
      addEventListener: jest.fn((eventType, handler) => {
        if (!eventHandlers[eventType]) {
          eventHandlers[eventType] = []
        }
        eventHandlers[eventType].push(handler)
      }),
      dispatchEvent: jest.fn((event) => {
        const handlers = eventHandlers[event.type] || []
        handlers.forEach((handler) => handler(event))
      }),
      removeEventListener: jest.fn((eventType, handler) => {
        eventHandlers[eventType] = eventHandlers[eventType]?.filter(h => h !== handler)
      }),
      init: jest.fn(),
      transformSearchRequest: jest.fn(),
      transformCallback: jest.fn(),
      setTargetMarker: jest.fn(),
      selectFeature: jest.fn(),
      queryFeature,
      queryPoint,
      showLabel,
      getNearest: jest.fn(),
      zoomIn,
      panBy,
      hideLabel: jest.fn(),
      remove: jest.fn()
    }
  })

  const renderComponent = (mockViewportOptions = {}, mockAppState = { id: 'map', isContainerReady: true }) => {
    const mockOptions = {
      id: 'map',
      styles: [{ name: 'default' }],
      bounds: [-2.989707, 54.864555, -2.878635, 54.937635],
      place: 'Carlisle',
      center: null,
      zoom: null,
      framework: null,
      queryFeature: ['mock-layer-name'],
      ...mockViewportOptions
    }

    const mockApp = {
      provider: providerMock,
      isPage: false,
      isMobile: false,
      isDesktop: false,
      isBack: false,
      parent: parentElement,
      handleExit: jest.fn(),
      viewportRef: { current: null },
      frameRef: { current: null },
      obscurePanelRef: { current: null },
      id: 'map',
      isContainerReady: true,
      activeRef: { current: null }
    }

    const mockViewportState = {
      styles: [{ name: 'default' }],
      style: { name: 'default' },
      ...mockViewportOptions
    }

    return render(
      <AppProvider app={mockApp} options={mockOptions}>
        <AppContextProvider mockState={mockAppState}>
          <ViewportProvider options={mockViewportState}>
            <Viewport />
          </ViewportProvider>
        </AppContextProvider>
      </AppProvider>
    )
  }

  it('should render viewport component', () => {
    renderComponent({ styles: [{ name: 'default' }], style: { name: 'default' } })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
  })

  // Test that viewport responds correctly to provider events

  it('should handle provider \'movestart\' event', async () => {
    const { container } = renderComponent()
    const statusElement = container.querySelector('.fm-c-status__inner')
    expect(statusElement).toHaveTextContent('')
    const moveStartEvent = new CustomEvent('movestart', { detail: { isUserInitiated: true } })
    act(() => { providerMock.dispatchEvent(moveStartEvent) })
    expect(screen.getByText('Map move')).toBeInTheDocument()
  })

  it('should handle provider \'update\' event with a new center', async () => {
    const { container } = renderComponent({
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const statusElement = container.querySelector('.fm-c-status__inner')
    expect(statusElement).toHaveTextContent('')
    const updateEvent = new CustomEvent('update', { detail: { bounds: [-2.965945, 54.864555, -2.838848, 54.937635], center: [-2.902397, 54.901112], zoom: 11.111696, features: { featuresTotal: null, featuresInViewport: [] } } })
    act(() => { providerMock.dispatchEvent(updateEvent) })
    expect(screen.getByText('east 1.3 miles. Use ALT plus I to get new details')).toBeInTheDocument()
  })

  it('should handle provider \'update\' event with a new label', async () => {
    const { container } = renderComponent({
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null
    })
    const statusElement = container.querySelector('.fm-c-status__inner')
    expect(statusElement).toHaveTextContent('')
    const updateEvent = new CustomEvent('update', { detail: { label: 'Test label', bounds: [-2.965945, 54.864555, -2.838848, 54.937635], center: [-2.902397, 54.901112], zoom: 11.111696, resultType: null, selectedId: null, features: { featuresTotal: null, featuresInViewport: [] } } })
    act(() => { providerMock.dispatchEvent(updateEvent) })
    expect(screen.getByText('Test label')).toBeInTheDocument()
  })

  it('should handle provider \'mapquery\' event with a map move', async () => {
    renderComponent({
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    const mapQueryEvent = new CustomEvent('mapquery', { detail: { resultType: 'feature', coord: [-2.926546, 54.915543], features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] } } })
    act(() => { providerMock.dispatchEvent(mapQueryEvent) })
    expect(viewportElement).toHaveAttribute('aria-activedescendant')
  })

  it('should handle provider \'style\' event', async () => {
    const dispatchEventSpy = jest.spyOn(parentElement, 'dispatchEvent')
    renderComponent()
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    const styleEvent = new CustomEvent('style', { detail: { type: 'basemap', basemap: 'dark' } })
    act(() => { providerMock.dispatchEvent(styleEvent) })
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: expect.objectContaining({
        basemap: 'dark'
      })
    }))
  })

  // Test that viewport responds correctly to keydown events

  it('should add \'aria-activedescendant\' when \'PageDown\' is pressed and features are in the viewport', async () => {
    renderComponent({
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null,
      features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] }
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyDown(viewportElement, { key: 'PageDown' }) })
    expect(viewportElement).toHaveAttribute('aria-activedescendant', 'map-feature-1000')
  })

  it('should call \'provider.queryPoint\' when \'Enter\' is pressed and no feature is selected', async () => {
    renderComponent({
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null,
      features: { featuresTotal: 0, items: [], featuresInViewport: [] },
      queryLocation: { layers: ['test'] }
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyDown(viewportElement, { key: 'Enter', altKey: false }) })
    expect(queryPoint).toHaveBeenCalled()
  })

  it('should call \'provider.queryFeature\' when \'Enter\' is pressed and a feature is selected', async () => {
    renderComponent({
      featureId: '1000',
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null,
      features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] }
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyDown(viewportElement, { key: 'Enter', altKey: false }) })
    expect(queryFeature).toHaveBeenCalled()
  })

  it('should call \'provider.zoomIn\' when \'=\' is pressed', async () => {
    renderComponent({ bounds: [-2.965945, 54.864555, -2.838848, 54.937635], center: [-2.934171, 54.901112], zoom: 11.111696, place: null })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyDown(viewportElement, { key: '=' }) })
    expect(zoomIn).toHaveBeenCalled()
  })

  it('should call \'provider.panBy\' when \'ArrowRight\' key is pressed', async () => {
    renderComponent({ bounds: [-2.965945, 54.864555, -2.838848, 54.937635], center: [-2.934171, 54.901112], zoom: 11.111696, place: null })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyDown(viewportElement, { key: 'ArrowRight' }) })
    expect(panBy).toHaveBeenCalledWith([100, 0])
  })

  // Test that viewport responds correctly to keyup events

  it('should call \'debounce\' with coordinate when \'Alt + I\' is pressed', async () => {
    const mockDebouncedFn = jest.fn()
    debounce.mockReturnValue(mockDebouncedFn)
    renderComponent({
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null,
      features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] }
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyUp(viewportElement, { key: 'I', code: 'KeyI', altKey: true }) })
    waitFor(() => { expect(mockDebouncedFn).toHaveBeenCalled([-2.902397, 54.901112]) })
  })

  it('should call appDispatch with { type: \'OPEN\', payload: \'KEYBOARD\' } when \'Alt + K\' is pressed', async () => {
    renderComponent({}, { id: 'map', isContainerReady: true, dispatch: appDispatchMock })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyUp(viewportElement, { key: 'K', code: 'KeyK', altKey: true }) })
    expect(appDispatchMock).toHaveBeenCalledWith({ type: 'OPEN', payload: 'KEYBOARD' })
  })

  it('should call \'provider.queryFeature\' with when \'Alt + 1\' is pressed', async () => {
    renderComponent({
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null,
      features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] }
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyUp(viewportElement, { key: '1', code: 'Key1', altKey: true }) })
    expect(queryFeature).toHaveBeenCalledWith('1000')
  })

  // Test that viewport responds correctly to click events

  it('should call \'provider.queryFeature\' on \'Click\'', async () => {
    renderComponent({
      featureId: '1000',
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null,
      features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] }
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.click(viewportElement, { clientX: 0, clientY: 0 }) })
    expect(queryFeature).toHaveBeenCalled()
  })

  it('should call \'provider.showLabel\' on \'Click\' when \'Alt\'is pressed', async () => {
    renderComponent({
      featureId: '1000',
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null,
      features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] }
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.click(viewportElement, { clientX: 0, clientY: 0, altKey: true }) })
    expect(showLabel).toHaveBeenCalled()
  })

  // Test that viewport responds correctly to pointer events

  test('should set startPixel on \'pointerdown\'', () => {
    const startPixel = { current: [0, 0] }
    jest.spyOn(React, 'useRef').mockReturnValue(startPixel)
    renderComponent({ size: 'small' })
    const viewportElement = screen.getByRole('application')
    act(() => { fireEvent.pointerDown(viewportElement, { pageX: 1, pageY: 1 }) })
    expect(startPixel.current).toEqual([1, 1])
  })
})
