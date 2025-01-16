import React, { useContext } from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AppProvider, AppContext } from '../../src/js/store/app-provider'
import { ViewportProvider, ViewportContext } from '../../src/js/store/viewport-provider'
import Viewport from '../../src/js/components/viewport'

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => {
    return {
      matches: true,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  })
})

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

describe('viewport', () => {
  let providerMock
  const eventHandlers = {}

  const parentElement = document.createElement('div')
  document.body.appendChild(parentElement)

  beforeEach(() => {
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
      requestCallback: jest.fn(),
      tileRequestCallback: jest.fn(),
      setTargetMarker: jest.fn(),
      selectFeature: jest.fn(),
      hideLabel: jest.fn(),
      remove: jest.fn()
    }
  })

  const renderComponent = (overides = {}) => {
    const app = {
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
      activeRef: null
    }

    const options = {
      id: 'map',
      bbox: [-2.989707, 54.864555, -2.878635, 54.937635],
      place: 'Carlisle',
      centre: null,
      zoom: null,
      framework: null,
      styles: { attribution: null },
      queryFeature: ['mock-layer-name'],
      ...overides
    }

    return render(
      <AppProvider app={app} options={options}>
        <AppContextProvider mockState={{
          id: 'map',
          isContainerReady: true
        }}
        >
          <ViewportProvider options={options}>
            <ViewportContextProvider mockState={{
              features: { featuresTotal: 1, items: [{ id: '1000', name: 'Flood alert for Lower River Eden' }], featuresInViewport: [{ id: '1000', name: 'Flood alert for Lower River Eden' }] }
            }}
            >
              <Viewport />
            </ViewportContextProvider>
          </ViewportProvider>
        </AppContextProvider>
      </AppProvider>
    )
  }

  it('should render viewport component', () => {
    renderComponent()
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
  })

  it('should handle provider \'movestart\' event', async () => {
    const { container } = renderComponent()
    const statusElement = container.querySelector('.fm-c-status__inner')
    expect(statusElement).toHaveTextContent('')
    const moveStartEvent = new CustomEvent('movestart', { detail: { isUserInitiated: true } })
    act(() => { providerMock.dispatchEvent(moveStartEvent) })
    expect(screen.getByText('Map move')).toBeInTheDocument()
  })

  it('should handle provider \'update\' event with a new centre', async () => {
    const { container } = renderComponent({ bbox: [-2.965945, 54.864555, -2.838848, 54.937635], centre: [-2.934171, 54.901112], zoom: 11.111696, place: null })
    const statusElement = container.querySelector('.fm-c-status__inner')
    expect(statusElement).toHaveTextContent('')
    const updateEvent = new CustomEvent('update', { detail: { bbox: [-2.965945, 54.864555, -2.838848, 54.937635], centre: [-2.902397, 54.901112], zoom: 11.111696, features: { featuresTotal: null, featuresInViewport: [] } } })
    act(() => { providerMock.dispatchEvent(updateEvent) })
    expect(screen.getByText('east 1.3 miles. Use ALT plus I to get new details')).toBeInTheDocument()
  })

  it('should handle provider \'update\' event with a new label', async () => {
    const { container } = renderComponent({ bbox: [-2.965945, 54.864555, -2.838848, 54.937635], centre: [-2.934171, 54.901112], zoom: 11.111696, place: null })
    const statusElement = container.querySelector('.fm-c-status__inner')
    expect(statusElement).toHaveTextContent('')
    const updateEvent = new CustomEvent('update', { detail: { label: 'Test label', bbox: [-2.965945, 54.864555, -2.838848, 54.937635], centre: [-2.902397, 54.901112], zoom: 11.111696, resultType: null, selectedId: null, features: { featuresTotal: null, featuresInViewport: [] } } })
    act(() => { providerMock.dispatchEvent(updateEvent) })
    expect(screen.getByText('Test label')).toBeInTheDocument()
  })

  it('should handle provider \'mapquery\' event with a map move', async () => {
    renderComponent({ bbox: [-2.965945, 54.864555, -2.838848, 54.937635], centre: [-2.934171, 54.901112], zoom: 11.111696, place: null })
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

  it('should handle \'keydown\' event with \'PageDown\' press', async () => {
    renderComponent({ bbox: [-2.965945, 54.864555, -2.838848, 54.937635], centre: [-2.934171, 54.901112], zoom: 11.111696, place: null })
    const viewportElement = screen.getByRole('application')
    expect(viewportElement).toBeTruthy()
    act(() => { fireEvent.keyDown(viewportElement, { key: 'PageDown', code: 'PageDown', keyCode: 34 }) })
    expect(viewportElement).toHaveAttribute('aria-activedescendant', 'map-feature-1000')
  })

  // JSDOM can't use el.closest??
  // it('should handle \'keydown\' event with \'Enter\' press', async () => {
  //   renderComponent({ bbox: [-2.965945, 54.864555, -2.838848, 54.937635], centre: [-2.934171, 54.901112], zoom: 11.111696, place: null })
  //   const viewportElement = screen.getByRole('application')
  //   expect(viewportElement).toBeTruthy()
  //   act(() => { fireEvent.keyDown(viewportElement, { key: 'Enter', code: 'Enter', keyCode: 13 }) })
  //   expect(viewportElement).toBeTruthy()
  //   expect(viewportElement).toHaveAttribute('aria-activedescendant', 'map-feature-1000')
  // })
})
