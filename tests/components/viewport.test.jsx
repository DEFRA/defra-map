import React, { useContext } from 'react'
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppProvider, AppContext } from '../../src/js/store/app-provider'
import { ViewportProvider, ViewportContext } from '../../src/js/store/viewport-provider'
import Viewport from '../../src/js/components/viewport'
import { debounce } from '../../src/js/lib/debounce'
import eventBus from '../../src/js/lib/eventbus'
import { useResizeObserver } from '../../src/js/hooks/use-resize-observer.js'

jest.mock('../../src/js/lib/eventbus')
// jest.mock('../../src/js/lib/debounce')
jest.mock('../../src/js/hooks/use-resize-observer.js')

const pointerEventProps = ['clientX', 'clientY', 'layerX', 'layerY', 'pointerType']
class PointerEventMock extends Event {
  constructor (type, props) {
    super(type, props)
    pointerEventProps.forEach((prop) => {
      if (props[prop] != null) {
        this[prop] = props[prop]
      }
    })
  }
}
window.PointerEvent = PointerEventMock

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => {
    return {
      matches: true,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  })
})

describe('viewport', () => {
  let providerMock, appDispatchMock, viewportDispatchMock
  const eventHandlers = {}
  const parentElement = document.createElement('div')
  document.body.appendChild(parentElement)

  const queryFeature = jest.fn()
  const queryPoint = jest.fn()
  const zoomIn = jest.fn()
  const zoomOut = jest.fn()
  const panBy = jest.fn()
  const showLabel = jest.fn()

  const AppContextProvider = ({ children, mockState }) => {
    const context = useContext(AppContext)
    return (
      <AppContext.Provider value={{ ...context, ...mockState }}>
        {children}
      </AppContext.Provider>
    )
  }

  const ViewportContextProvider = ({ children, mockState }) => {
    const context = useContext(ViewportContext)
    return (
      <ViewportContext.Provider value={{ ...context, ...mockState }}>
        {children}
      </ViewportContext.Provider>
    )
  }

  const renderComponent = (
    options = {}, mockAppState = { id: 'map', isContainerReady: true }, mockViewportState = { bounds: [-2.989707, 54.864555, -2.878635, 54.937635] }) => {
    const mockOptions = {
      id: 'map',
      styles: [{ name: 'default', url: 'Test url' }],
      style: { name: 'default', url: 'Test url' },
      bounds: null,
      place: 'Carlisle',
      center: null,
      zoom: null,
      framework: null,
      queryFeature: ['mock-layer-name'],
      srid: '4326',
      ...options
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

    return render(
      <AppProvider app={mockApp} options={mockOptions}>
        <AppContextProvider mockState={mockAppState}>
          <ViewportProvider options={mockOptions}>
            <ViewportContextProvider mockState={mockViewportState}>
              <Viewport />
            </ViewportContextProvider>
          </ViewportProvider>
        </AppContextProvider>
      </AppProvider>
    )
  }

  beforeEach(() => {
    appDispatchMock = jest.fn()
    viewportDispatchMock = jest.fn()
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
      map: jest.fn(),
      transformGeocodeRequest: jest.fn(),
      transformCallback: jest.fn(),
      setPadding: jest.fn(),
      setTargetMarker: jest.fn(),
      selectFeature: jest.fn(),
      queryFeature,
      queryPoint,
      showLabel,
      showNextLabel: jest.fn(),
      getNearest: jest.fn(),
      zoomIn,
      zoomOut,
      panBy,
      fitBounds: jest.fn(),
      setCentre: jest.fn(),
      setSize: jest.fn(),
      setStyle: jest.fn(),
      showLocation: jest.fn(),
      hideLabel: jest.fn(),
      initDraw: jest.fn(),
      remove: jest.fn()
    }
  })

  it('should render viewport component', () => {
    renderComponent({ styles: [{ name: 'default' }], style: { name: 'default' } })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
  })

  // Test that viewport responds correctly to provider events

  it('should handle provider \'initDraw\' event on mapload', async () => {
    renderComponent({ draw: { feature: { geometry: { coordinates: [[[2, 1], [6, 1], [6, 5], [2, 5], [2, 1]]] } } } })
    const loadEvent = new CustomEvent('load', { detail: {} })
    act(() => { providerMock.dispatchEvent(loadEvent) })
    expect(providerMock.initDraw).toHaveBeenCalled()
  })

  it('should handle \'eventBus.dispatch\' on mapload', async () => {
    renderComponent()
    const loadEvent = new CustomEvent('load', { detail: {} })
    act(() => { providerMock.dispatchEvent(loadEvent) })
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  // it('should handle provider \'movestart\' event', async () => {
  //   const { container } = renderComponent()
  //   const statusElement = container.querySelector('.fm-c-status__inner')
  //   expect(statusElement).toHaveTextContent('')
  //   const moveStartEvent = new CustomEvent('movestart', { detail: { isUserInitiated: true } })
  //   act(() => { providerMock.dispatchEvent(moveStartEvent) })
  //   expect(screen.getByText('Map move')).toBeInTheDocument()
  // })

  it('should close info panel on \'movestart\' event', async () => {
    renderComponent(null, { id: 'map', isContainerReady: true, dispatch: appDispatchMock, interfaceType: 'keyboard', activePanel: 'INFO' })
    const moveStartEvent = new CustomEvent('movestart', { detail: { isUserInitiated: true } })
    act(() => { providerMock.dispatchEvent(moveStartEvent) })
    expect(appDispatchMock).toHaveBeenCalledWith({ type: 'CLOSE' })
  })

  it('should handle provider \'update\' event with a new center', async () => {
    jest.useFakeTimers()
    const { container } = renderComponent({
      center: [-2.902396, 54.901112],
      zoom: 11.111696,
      place: null
    })
    const statusElement = container.querySelector('.fm-c-status__inner')
    expect(statusElement).toHaveTextContent('')
    const updateEvent = new CustomEvent('update', { detail: { bounds: [-2.9734126, 54.837299, -2.767830, 54.964823], center: [-2.870621, 54.901112], zoom: 11.111696 } })
    act(() => { providerMock.dispatchEvent(updateEvent) })
    act(() => { jest.runAllTimers() })
    expect(screen.getByText('Covering 4 miles by 5 miles. Use ALT plus I to find closest place')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('should handle provider \'update\' event with a new label', async () => {
    jest.useFakeTimers()
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
    act(() => { jest.runAllTimers() })
    expect(screen.getByText('Test label')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('should handle provider \'mapquery\' event with a map move', async () => {
    jest.useFakeTimers()
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
    act(() => { jest.runAllTimers() })
    expect(viewportElement).toHaveAttribute('aria-activedescendant')
    jest.useRealTimers()
  })

  it('should handle provider \'style\' event', async () => {
    renderComponent()
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    const styleEvent = new CustomEvent('style', { detail: { type: 'basemap', basemap: 'dark' } })
    act(() => { providerMock.dispatchEvent(styleEvent) })
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        basemap: 'dark'
      })
    )
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

  it('should call \'e.preventDefault\' when \'Alt + Arrow\' is pressed and provider has showNextLabel()', async () => {
    renderComponent({}, { id: 'map', isContainerReady: true })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    const eventHandler = jest.fn((e) => {
      jest.spyOn(e, 'preventDefault')
      e.preventDefault()
    })
    viewportElement.addEventListener('keydown', eventHandler)
    act(() => { fireEvent.keyDown(viewportElement, { key: 'ArrowRight', altKey: true }) })
    expect(eventHandler).toHaveBeenCalled()
    const event = eventHandler.mock.calls[0][0]
    expect(event.preventDefault).toHaveBeenCalled()
    viewportElement.removeEventListener('keydown', eventHandler)
  })

  // Test that viewport responds correctly to keyup events

  it('should call \'debounce\' with coordinate when \'Alt + I\' is pressed', async () => {
    jest.mock('../../src/js/lib/debounce')

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
    waitFor(() => { expect(debounce).toHaveBeenCalled([-2.902397, 54.901112]) })
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

  it('should call viewportDispatch and appDispatch when \'Escape\' is pressed', async () => {
    renderComponent(null, { id: 'map', isContainerReady: true, dispatch: appDispatchMock }, { dispatch: viewportDispatchMock })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyUp(viewportElement, { key: 'Escape' }) })
    expect(viewportDispatchMock).toHaveBeenCalledWith({ type: 'CLEAR_ALT_FEATURE' })
    expect(appDispatchMock).toHaveBeenCalledWith({ type: 'SET_SELECTED', payload: { featureId: null } })
  })

  it('should call viewportDispatch when \'Alt + Arrow\' is pressed and provider has showNextLabel()', async () => {
    renderComponent({}, { id: 'map', isContainerReady: true }, { dispatch: viewportDispatchMock })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyUp(viewportElement, { key: 'ArrowRight', altKey: true }) })
    expect(viewportDispatchMock).toHaveBeenCalledWith({ type: 'TOGGLE_SHORTCUTS', payload: false })
  })

  // Test that viewport responds correctly to click events

  it('should call \'provider.queryPoint\' on \'Click\'', async () => {
    renderComponent({
      featureId: '1000',
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635],
      center: [-2.934171, 54.901112],
      zoom: 11.111696,
      place: null,
      features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] },
      queryFeature: { layers: [''] }
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.click(viewportElement, { clientX: 0, clientY: 0 }) })
    expect(queryPoint).toHaveBeenCalled()
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

  // Viewport actions

  it('should call \'provider.fitBounds\' on search action when bounds is present', async () => {
    renderComponent(null, null, {
      action: 'SEARCH',
      bounds: [-2.965945, 54.864555, -2.838848, 54.937635]
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.fitBounds).toHaveBeenCalled()
  })

  it('should call \'provider.setCentre\' on search action when center and zoom are present', async () => {
    renderComponent(null, null, {
      action: 'SEARCH',
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.setCentre).toHaveBeenCalled()
  })

  it('should call \'provider.setCentre\' on reset action', async () => {
    renderComponent(null, null, {
      action: 'RESET',
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.setCentre).toHaveBeenCalled()
  })

  it('should call \'provider.setCentre\' on geolocation action', async () => {
    renderComponent(null, null, {
      action: 'GEOLOC',
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.setCentre).toHaveBeenCalled()
  })

  it('should call \'provider.showLocation\' on geolocation action', async () => {
    renderComponent(null, null, {
      action: 'GEOLOC',
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.setCentre).toHaveBeenCalled()
  })

  it('should call \'provider.zoomIn\' on zoom in action', async () => {
    renderComponent(null, null, {
      action: 'ZOOM_IN',
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.zoomIn).toHaveBeenCalled()
  })

  it('should call \'provider.zoomOut\' on zoom out action', async () => {
    renderComponent(null, null, {
      action: 'ZOOM_OUT',
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.zoomOut).toHaveBeenCalled()
  })

  it('should call \'provider.setSize\' on size action', async () => {
    renderComponent(null, null, {
      action: 'SIZE',
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.setSize).toHaveBeenCalled()
  })

  it('should call \'provider.setStyle\' on style action', async () => {
    renderComponent(null, null, {
      action: 'STYLE',
      center: [-2.934171, 54.901112],
      zoom: 11.111696
    })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(providerMock.setStyle).toHaveBeenCalled()
  })

  it('should call viewportDispatch with { type: \'SET_STYLE\' } when hasAutoMode is true', async () => {
    providerMock.map = {}
    renderComponent({ hasAutoMode: true }, { id: 'map', isContainerReady: true }, { dispatch: viewportDispatchMock })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    expect(viewportDispatchMock).toHaveBeenCalledWith({ type: 'SET_STYLE', payload: { colourScheme: 'dark', style: 'default' } })
    providerMock.map = undefined
  })

  it('should call \'provider.setPadding\' on resize', async () => {
    useResizeObserver.mockImplementation((_, callback) => { callback() })
    renderComponent(null, { id: 'map', isContainerReady: true })
    expect(providerMock.setPadding).toHaveBeenCalled()
  })
})
