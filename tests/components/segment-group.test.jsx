import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import SegmentGroup from '../../src/js/components/segment-group'

import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('segment-group', () => {
  const appDispatch = jest.fn()
  const viewportDispatch = jest.fn()

  jest.mocked(useViewport).mockReturnValue({
    dispatch: viewportDispatch,
    size: 100
  })

  jest.mocked(useApp).mockReturnValue({
    dispatch: appDispatch,
    parent: document.body,
    style: undefined,
    drawMode: 'default',
    segments: ['fz'],
    activeRef: { current: null },
    legend: {
      width: '280px',
      keyWidth: '360px',
      isVisible: true,
      title: 'Menu',
      segments: [
        {
          collapse: 'collapse',
          heading: 'Datasets',
          items: [
            { id: 'fz', label: 'Flood zones 2 and 3' },
            { id: 'rsd', label: 'River and sea with defences' },
            { id: 'rsu', label: 'River and sea without defences' },
            { id: 'sw', label: 'Surface water' },
            { id: 'mo', label: 'None' }
          ]
        },
        {
          collapse: 'collapse',
          heading: 'Time frame',
          items: [
            { id: 'pd', label: 'Present day' }
          ]
        }
      ]
    }
  })

  it('should render in a collapsed state', () => {
    const { container } = render(
      <SegmentGroup
        id='test'
        group={{
          collapse: 'collapse',
          heading: 'Datasets',
          isDetails: true,
          isExpanded: false,
          items: [
            { id: 'fz', label: 'Flood zones 2 and 3' },
            { id: 'rsd', label: 'River and sea with defences' },
            { id: 'rsu', label: 'River and sea without defences' },
            { id: 'sw', label: 'Surface water' },
            { id: 'mo', label: 'None' }
          ]
        }}
      />
    )

    expect(container.querySelector('.fm-c-segments')).toBeTruthy()
    expect(container.querySelector('.fm-c-details__label-focus').textContent).toEqual('Datasets')
    expect(container.querySelector('.fm-c-details__toggle-focus').textContent).toEqual('Show')
    expect(container.querySelectorAll('.fm-c-segments__item').length).toEqual(5)
  })

  it('should expand details', () => {
    const { container } = render(
      <SegmentGroup
        id='test'
        group={{
          collapse: 'collapse',
          heading: 'Datasets',
          isDetails: true,
          isExpanded: false,
          display: 'timeline',
          items: [
            { id: 'fz', label: 'Flood zones 2 and 3' },
            { id: 'rsd', label: 'River and sea with defences' },
            { id: 'rsu', label: 'River and sea without defences' },
            { id: 'sw', label: 'Surface water' },
            { id: 'mo', label: 'None' }
          ]
        }}
      />
    )

    fireEvent.click(container.querySelector('.fm-c-details'))

    act(() => {
      expect(container.querySelector('.fm-c-details').getAttribute('aria-expanded')).toEqual('true')
      expect(container.querySelector('.fm-c-details__toggle-focus').textContent).toEqual('Hide')
    })
  })

  it('should handle item click', () => {
    const { container } = render(
      <SegmentGroup
        id='test'
        group={{
          collapse: 'collapse',
          heading: 'Datasets',
          isDetails: true,
          isExpanded: false,
          display: 'timeline',
          items: [
            { id: 'fz', label: 'Flood zones 2 and 3' },
            { id: 'rsd', label: 'River and sea with defences' },
            { id: 'rsu', label: 'River and sea without defences' },
            { id: 'sw', label: 'Surface water' },
            { id: 'mo', label: 'None' }
          ]
        }}
      />
    )

    fireEvent.click(container.querySelector('.fm-c-segments__button'))

    act(() => {
      expect(appDispatch).toHaveBeenCalled()
      expect(viewportDispatch).toHaveBeenCalled()
    })
  })

  it('should render with a display modifier class when display prop is provided', () => {
    const { container } = render(
      <SegmentGroup
        id='test'
        group={{
          collapse: 'collapse',
          heading: 'Datasets',
          isDetails: true,
          isExpanded: false,
          display: 'timeline', // Testing with display prop
          items: [
            { id: 'fz', label: 'Flood zones 2 and 3' }
          ]
        }}
      />
    )

    expect(container.querySelector('.fm-c-segments--timeline')).toBeTruthy()
  })

  it('should render without display modifier class when display \'ramp\' is not provided', () => {
    const { container } = render(
      <SegmentGroup
        id='test'
        group={{
          collapse: 'collapse',
          heading: 'Datasets',
          isDetails: true,
          isExpanded: false,
          items: [
            { id: 'fz', label: 'Flood zones 2 and 3' }
          ]
        }}
      />
    )

    expect(container.querySelector('.fm-c-segments')).toBeTruthy()
    expect(container.querySelector('[class*="fm-c-segments--ramp"]')).toBeFalsy()
  })

  it('should not be visible when isHidden is true', () => {
    const { container } = render(
      <SegmentGroup
        id='test'
        group={{
          collapse: 'collapse',
          heading: 'Datasets',
          isDetails: true,
          isExpanded: false,
          isHidden: true, // Move isHidden into the group object
          items: [
            { id: 'fz', label: 'Flood zones 2 and 3' }
          ]
        }}
      />
    )

    const segmentsElement = container.querySelector('.fm-c-segments')
    expect(segmentsElement).toHaveAttribute('style', 'display: none;')
  })

  it('should render h3 heading when heading is provided and isDetails is false', () => {
    const { container } = render(
      <SegmentGroup
        id='test'
        group={{
          heading: 'Test Heading',
          isDetails: false,
          items: [
            { id: 'fz', label: 'Flood zones 2 and 3' }
          ]
        }}
      />
    )

    const headingElement = container.querySelector('.fm-c-layers__heading')
    expect(headingElement).toBeInTheDocument()
    expect(headingElement.textContent).toBe('Test Heading')
  })

  // it('should render h3 heading visually hidden is not provided and isDetails is false', () => {
  //   const { container } = render(
  //     <SegmentGroup
  //       id='test'
  //       group={{
  //         isDetails: false,
  //         items: [
  //           { id: 'fz', label: 'Flood zones 2 and 3' }
  //         ]
  //       }}
  //     />
  //   )

  //   const legendElement = container.querySelector('.fm-c-layers__legend')
  //   expect(headingElement).not.toBeInTheDocument()
  // })
})
