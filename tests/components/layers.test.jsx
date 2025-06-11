import React from 'react'
import { act, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Layers from '../../src/js/components/layers'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import * as dom from '../../src/js/lib/dom'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/lib/viewport')
jest.mock('../../src/js/lib/dom')

describe('layers', () => {
  const appDispatch = jest.fn()
  const activeRef = { current: document.createElement('div') }
  const mockFindTabStop = jest.fn().mockReturnValue(undefined)

  jest.mocked(useViewport).mockReturnValue({
    zoom: 9.49131,
    currentZoom: 9.49131,
    size: 'smaill',
    style: {
      attribution: 'Contains OS data © Crown copyright and database rights 2025',
      name: 'default',
      url: 'https://labs.os.uk/tiles/styles/open-zoomstack-outdoor/style.json'
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Set up fetch mock
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('<svg viewBox="0 0 40 40"><path d="M33.565" style="fill:#0b0c0c;"/></svg>')
      })
    )

    jest.mocked(dom.findTabStop).mockImplementation(mockFindTabStop)
  })

  // Clean up after tests
  afterEach(() => {
    global.fetch = undefined
  })

  it('should not render any features', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      isKeyExpanded: false,
      activeRef,
      segments: [],
      options: {
        id: 'test',
        legend: {
          key: []
        },
        queryArea: {}
      }
    })

    render(<Layers />)

    expect(screen.getByText('No features displayed')).toBeTruthy()
  })

  it('should render layer groups', () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(['<svg viewBox="0 0 40 40"><path d="M33.565" style="fill:#0b0c0c;"/></svg>'])
      })
    )

    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      isKeyExpanded: false,
      activeRef,
      segments: ['li'],
      layers: ['ts', 'tw', 'ta'],
      options: {
        id: 'test',
        legend: {
          display: 'inset',
          key: [{
            heading: 'Flood warnings and alerts',
            layout: 'column',
            maxZoom: 12,
            parentIds: ['li'],
            items: [
              {
                icon: '/assets/images/symbols/severe.svg',
                id: 'ts',
                isSelected: true,
                label: 'Severe'
              },
              {
                icon: '/assets/images/symbols/warning.svg',
                id: 'tw',
                label: 'Warning'
              },
              {
                icon: '/assets/images/symbols/alert.svg',
                id: 'ta',
                label: 'Alert'
              },
              {
                icon: '/assets/images/symbols/removed.svg',
                id: 'tr',
                label: 'Removed'
              }
            ]
          }]
        },
        queryArea: {}
      }
    })

    let container

    act(() => {
      container = render(<Layers hasSymbols hasInputs />).container
    })

    screen.debug()
    expect(container.querySelectorAll('.fm-c-layers__button')).toHaveLength(4)
    expect(screen.getByText('Severe')).toBeTruthy()
    expect(screen.getByText('Warning')).toBeTruthy()
    expect(screen.getByText('Alert')).toBeTruthy()
    expect(screen.getByText('Removed')).toBeTruthy()
  })

  it('should render more button if there are one or more groups with isHidden', () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(['<svg viewBox="0 0 40 40"><path d="M33.565" style="fill:#0b0c0c;"/></svg>'])
      })
    )

    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      isKeyExpanded: false,
      activeRef,
      segments: ['li'],
      layers: ['ts', 'tw', 'ta'],
      options: {
        id: 'test',
        legend: {
          display: 'inset',
          keyDisplay: 'min',
          key: [
            {
              heading: 'Flood warnings and alerts',
              layout: 'column',
              maxZoom: 12,
              parentIds: ['li'],
              items: [
                {
                  icon: '/assets/images/symbols/severe.svg',
                  id: 'ts',
                  isSelected: true,
                  label: 'Severe'
                },
                {
                  icon: '/assets/images/symbols/warning.svg',
                  id: 'tw',
                  label: 'Warning'
                },
                {
                  icon: '/assets/images/symbols/alert.svg',
                  id: 'ta',
                  label: 'Alert'
                },
                {
                  icon: '/assets/images/symbols/removed.svg',
                  id: 'tr',
                  label: 'Removed'
                }
              ]
            },
            {
              heading: 'Alerts',
              layout: 'column',
              maxZoom: 12,
              parentIds: ['li'],
              isHidden: true,
              items: [
                {
                  icon: '/assets/images/symbols/alert.svg',
                  id: 'ta',
                  label: 'Alert'
                }
              ]
            }
          ]
        },
        queryArea: {}
      }
    })

    let container

    act(() => {
      container = render(<Layers hasSymbols hasInputs />).container
    })

    expect(container.querySelector('.fm-c-layers__more')).toBeTruthy()
  })

  it('should handle findTabStop returning undefined gracefully', async () => {
    const appDispatch = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      isKeyExpanded: false,
      activeRef,
      segments: ['li'],
      layers: ['ts', 'tw', 'ta'],
      options: {
        id: 'test',
        legend: {
          display: 'inset',
          key: [{
            heading: 'Flood warnings and alerts',
            layout: 'column',
            maxZoom: 12,
            parentIds: ['li'],
            items: [
              {
                icon: '/assets/images/symbols/severe.svg',
                id: 'ts',
                isSelected: true,
                label: 'Severe'
              },
              {
                icon: '/assets/images/symbols/warning.svg',
                id: 'tw',
                label: 'Warning'
              },
              {
                icon: '/assets/images/symbols/alert.svg',
                id: 'ta',
                label: 'Alert'
              }
            ]
          }]
        },
        queryArea: {}
      }
    })

    let component
    await act(async () => {
      component = render(<Layers hasSymbols hasInputs />)
      await Promise.resolve()
    })

    // Update to isKeyExpanded true
    await act(async () => {
      jest.mocked(useApp).mockReturnValue({
        dispatch: appDispatch,
        isKeyExpanded: true,
        activeRef,
        segments: ['li'],
        layers: ['ts', 'tw', 'ta'],
        options: {
          id: 'test',
          legend: {
            display: 'inset',
            key: [{
              heading: 'Flood warnings and alerts',
              layout: 'column',
              maxZoom: 12,
              parentIds: ['li'],
              items: [
                {
                  icon: '/assets/images/symbols/severe.svg',
                  id: 'ts',
                  isSelected: true,
                  label: 'Severe'
                },
                {
                  icon: '/assets/images/symbols/warning.svg',
                  id: 'tw',
                  label: 'Warning'
                },
                {
                  icon: '/assets/images/symbols/alert.svg',
                  id: 'ta',
                  label: 'Alert'
                }
              ]
            }]
          },
          queryArea: {}
        }
      })
      component.rerender(<Layers hasSymbols hasInputs />)
      await Promise.resolve()
    })

    // Wait for any remaining state updates
    await act(async () => {
      await Promise.resolve()
    })

    // Verify findTabStop was called but didn't cause any errors
    expect(dom.findTabStop).toHaveBeenCalledWith(activeRef.current, 'next')
  })

  it('should not render the "more" button if all groups are visible', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: jest.fn(),
      isKeyExpanded: true,
      activeRef: { current: null },
      options: {
        legend: {
          display: 'inset',
          keyDisplay: 'max',
          key: [
            { heading: 'Group 1', items: [] },
            { heading: 'Group 2', items: [] }
          ]
        }
      },
      segments: [],
      layers: []
    })

    const { container } = render(<Layers />)

    expect(container.querySelector('.fm-c-layers__more')).toBeNull()
  })
})
