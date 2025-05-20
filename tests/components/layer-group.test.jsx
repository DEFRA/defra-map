import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'

import LayerGroup from '../../src/js/components/layer-group'

import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('layer-group', () => {
  const appDispatch = jest.fn()
  const viewportDispatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useViewport).mockReturnValue({
      dispatch: viewportDispatch,
      size: 100,
      style: {
        name: 'default'
      }
    })

    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      parent: document.body,
      drawMode: null,
      segments: ['li'],
      layers: ['ts', 'tw', 'ta']
    })

    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(['<svg viewBox="0 0 40 40"><path d="M33.565" style="fill:#0b0c0c;"/></svg>'])
      })
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render with heading', () => {
    render(
      <LayerGroup
        id='l0'
        group={{
          heading: 'Flood warnings and alerts',
          layout: 'column',
          maxZoom: 12,
          parentIds: ['li'],
          items: [
            {
              id: 'ts',
              label: 'Severe',
              icon: '/assets/images/symbols/severe.svg',
              isSelected: true
            },
            {
              id: 'tw',
              label: 'Warning',
              icon: '/assets/images/symbols/warning.svg'
            },
            {
              id: 'ta',
              label: 'Alert',
              icon: '/assets/images/symbols/alert.svg'
            },
            {
              id: 'tr',
              label: 'Removed',
              icon: '/assets/images/symbols/removed.svg'
            }
          ]
        }}
      />
    )

    expect(screen.getByText(/Flood warnings and alerts/)).toBeTruthy()
    expect(screen.getByText(/Severe/)).toBeTruthy()
    expect(screen.getByText(/Warning/)).toBeTruthy()
    expect(screen.getByText(/Alert/)).toBeTruthy()
    expect(screen.getByText(/Removed/)).toBeTruthy()
  })

  it('should render details', () => {
    const { container } = render(
      <LayerGroup
        hasInputs
        id='l0'
        group={{
          heading: 'Flood warnings and alerts',
          layout: null,
          maxZoom: 12,
          parentIds: ['li'],
          collapse: 'expanded',
          items: [
            {
              id: 'ts',
              label: 'Severe',
              icon: '/assets/images/symbols/severe.svg',
              isSelected: true
            },
            {
              id: 'tw',
              label: 'Warning',
              icon: '/assets/images/symbols/warning.svg'
            },
            {
              id: 'ta',
              label: 'Alert',
              icon: '/assets/images/symbols/alert.svg'
            },
            {
              id: 'tr',
              label: 'Removed',
              icon: '/assets/images/symbols/removed.svg'
            }
          ]
        }}
      />
    )

    expect(container.querySelector('.fm-c-details')).toBeTruthy()
    expect(container.querySelector('.fm-c-details__summary-focus').textContent).toEqual('Severe, Warning, Alert')
    expect(container.querySelector('.fm-c-details__toggle-focus').textContent).toEqual('Hide')
  })

  it('should handle group item button click', () => {
    const { container } = render(
      <LayerGroup
        hasInputs
        id='l0'
        group={{
          heading: 'Flood warnings and alerts',
          layout: 'column',
          maxZoom: 12,
          parentIds: ['li'],
          items: [
            {
              id: 'ts',
              label: 'Severe',
              icon: '/assets/images/symbols/severe.svg',
              isSelected: true
            },
            {
              id: 'tw',
              label: 'Warning',
              icon: '/assets/images/symbols/warning.svg'
            },
            {
              id: 'ta',
              label: 'Alert',
              icon: '/assets/images/symbols/alert.svg'
            },
            {
              id: 'tr',
              label: 'Removed',
              icon: '/assets/images/symbols/removed.svg'
            }
          ]
        }}
      />
    )

    fireEvent.click(container.querySelector('.fm-c-layers__button'))

    act(() => {
      expect(appDispatch).toHaveBeenCalled()
      expect(viewportDispatch).toHaveBeenCalled()
    })
  })

  it('should handle group item radio change', () => {
    const { container } = render(
      <LayerGroup
        hasInputs
        id='l0'
        group={{
          type: 'radio',
          heading: 'Flood warnings and alerts',
          layout: 'column',
          maxZoom: 12,
          parentIds: ['li'],
          items: [
            {
              id: 'ts',
              label: 'Severe',
              icon: '/assets/images/symbols/severe.svg',
              isSelected: true
            },
            {
              id: 'tw',
              label: 'Warning',
              icon: '/assets/images/symbols/warning.svg'
            },
            {
              id: 'ta',
              label: 'Alert',
              icon: '/assets/images/symbols/alert.svg'
            },
            {
              id: 'tr',
              label: 'Removed',
              icon: '/assets/images/symbols/removed.svg'
            }
          ]
        }}
      />
    )

    fireEvent.click(container.querySelector('#tw'))

    act(() => {
      expect(appDispatch).toHaveBeenCalled()
      expect(viewportDispatch).toHaveBeenCalled()
    })
  })

  it('should render key symbols: icon', () => {
    const { container } = render(
      <LayerGroup
        hasInputs
        hasSymbols
        id='l0'
        group={{
          type: 'radio',
          heading: 'Flood warnings and alerts',
          layout: 'column',
          maxZoom: 12,
          parentIds: ['li'],
          display: 'icon',
          items: [
            {
              id: 'ts',
              label: 'Severe',
              icon: '/assets/images/symbols/severe.svg',
              isSelected: true,
              fill: 'red'
            }
          ]
        }}
      />
    )

    expect(container.querySelector('.fm-c-layers__image--icon')).toBeTruthy()
  })

  it('should render key symbols: fill', () => {
    const { container } = render(
      <LayerGroup
        hasInputs
        hasSymbols
        id='l0'
        group={{
          type: 'radio',
          heading: 'Flood warnings and alerts',
          layout: 'column',
          maxZoom: 12,
          parentIds: ['li'],
          display: 'fill',
          items: [
            {
              id: 'ts',
              label: 'Severe',
              icon: '/assets/images/symbols/severe.svg',
              isSelected: true,
              fill: 'red'
            }
          ]
        }}
      />
    )

    expect(container.querySelector('.fm-c-layers__image--fill')).toBeTruthy()
    expect(container.querySelector('svg[fill="red"]')).toBeTruthy()
  })

  it('should render key symbols: query-polygon', () => {
    const { container } = render(
      <LayerGroup
        hasInputs
        hasSymbols
        id='l0'
        group={{
          type: 'radio',
          heading: 'Flood warnings and alerts',
          layout: 'column',
          maxZoom: 12,
          parentIds: ['li'],
          display: 'query-polygon',
          items: [
            {
              id: 'ts',
              label: 'Severe',
              icon: '/assets/images/symbols/severe.svg',
              isSelected: true,
              fill: 'red'
            }
          ]
        }}
      />
    )

    expect(container.querySelector('.fm-c-layers__image--query-polygon')).toBeTruthy()
    expect(container.querySelector('svg[fill="none"]')).toBeTruthy()
  })

  it('should render key symbols: ramp', () => {
    const { container } = render(
      <LayerGroup
        hasInputs
        hasSymbols
        id='l0'
        group={{
          type: 'radio',
          heading: 'Flood warnings and alerts',
          layout: 'column',
          maxZoom: 12,
          parentIds: ['li'],
          display: 'ramp',
          items: [
            {
              id: 'ts',
              label: 'Severe',
              icon: '/assets/images/symbols/severe.svg',
              isSelected: true,
              fill: 'red'
            }
          ]
        }}
      />
    )

    expect(container.querySelector('.fm-c-layers__image--ramp')).toBeTruthy()
    expect(container.querySelector('svg[fill="red"]')).toBeTruthy()
    expect(container.querySelector('svg[stroke="red"]')).toBeTruthy()
  })

  it('should handle details click and toggle expanded state', () => {
    const group = {
      heading: 'Test Group',
      collapse: 'expanded',
      layout: 'row',
      items: [
        { id: 'item1', label: 'Item 1' }
      ]
    }

    const { container } = render(
      <LayerGroup
        id='test-group'
        group={group}
        hasSymbols
        hasInputs
      />
    )

    // Find the details button
    const detailsButton = container.querySelector('.fm-c-details')
    expect(detailsButton).toBeTruthy()

    // Initial state should be expanded
    expect(detailsButton.getAttribute('aria-expanded')).toBe('true')

    // Click the button
    fireEvent.click(detailsButton)

    // State should now be collapsed
    expect(detailsButton.getAttribute('aria-expanded')).toBe('false')

    // Click again
    fireEvent.click(detailsButton)

    // State should be expanded again
    expect(detailsButton.getAttribute('aria-expanded')).toBe('true')
  })
  it('should not render items when hasSymbols is false', () => {
    const group = {
      heading: 'Test Group',
      items: [{
        label: 'Parent Item',
        items: [{ label: 'Child Item' }]
      }]
    }

    const { container } = render(
      <LayerGroup
        id='test-group'
        group={group}
        hasSymbols={false}
        hasInputs
      />
    )

    expect(container.querySelector('.fm-c-layers__item')).toBeNull()
  })

  it('should render items with icon display when child has icon', () => {
    const group = {
      heading: 'Test Group',
      items: [{
        label: 'Parent Item',
        items: [{
          label: 'Child Item',
          icon: 'test-icon'
        }]
      }]
    }

    const { container } = render(
      <LayerGroup
        id='test-group'
        group={group}
        hasSymbols
        hasInputs
      />
    )

    expect(container.querySelector('.fm-c-layers__item--icon')).toBeTruthy()
  })

  it('should render items with fill display when child has no icon', () => {
    const group = {
      heading: 'Test Group',
      items: [{
        label: 'Parent Item',
        items: [{
          label: 'Child Item'
        }]
      }]
    }

    const { container } = render(
      <LayerGroup
        id='test-group'
        group={group}
        hasSymbols
        hasInputs
      />
    )

    expect(container.querySelector('.fm-c-layers__item--fill')).toBeTruthy()
  })

  it('should use parent item display when specified', () => {
    const group = {
      heading: 'Test Group',
      items: [{
        label: 'Parent Item',
        display: 'custom-display',
        items: [{
          label: 'Child Item',
          icon: 'test-icon' // This would normally make it 'icon' display
        }]
      }]
    }

    const { container } = render(
      <LayerGroup
        id='test-group'
        group={group}
        hasSymbols
        hasInputs
      />
    )

    expect(container.querySelector('.fm-c-layers__item--custom-display')).toBeTruthy()
  })

  it('should handle items without child items array', () => {
    const group = {
      heading: 'Test Group',
      items: [{
        label: 'Parent Item'
        // No items array
      }]
    }

    const { container } = render(
      <LayerGroup
        id='test-group'
        group={group}
        hasSymbols
        hasInputs
      />
    )

    // Should render without errors
    expect(container).toBeTruthy()
  })
})
