import React from 'react'
import { act, render, screen } from '@testing-library/react'

import Layers from '../../src/js/components/layers'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/lib/viewport')

describe('layers', () => {
  const appDispatch = jest.fn()
  const activeRef = {}

  jest.mocked(useViewport).mockReturnValue({
    zoom: 9.49131,
    size: 'smaill',
    style: {
      attribution: 'Contains OS data © Crown copyright and database rights 2025',
      name: 'default',
      url: 'https://labs.os.uk/tiles/styles/open-zoomstack-outdoor/style.json'
    }
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

    expect(container.querySelectorAll('.fm-c-layers__button')).toHaveLength(4)
    expect(screen.getByText('Severe')).toBeTruthy()
    expect(screen.getByText('Warning')).toBeTruthy()
    expect(screen.getByText('Alert')).toBeTruthy()
    expect(screen.getByText('Removed')).toBeTruthy()
  })

  it('should render more button if there are multiple groups', () => {
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
})
