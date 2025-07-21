import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import LegendButton from '../../src/js/components/legend-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('legend-button', () => {
  const mockDispatch = jest.fn()
  const mockLegendBtnRef = { current: null }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle click', () => {
    const dispatch = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      dispatch,
      isDesktop: false,
      isEditMode: false,
      options: null,
      mode: null,
      legend: {}
    })

    render(<LegendButton legendBtnRef={null} />)

    fireEvent.click(screen.getByText('Layers'))

    expect(dispatch).toHaveBeenCalled()
  })

  it('should show legend title', () => {
    const dispatch = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      dispatch,
      isDesktop: false,
      isEditMode: false,
      options: null,
      mode: null,
      legend: { title: 'legend title' }
    })

    const { container } = render(<LegendButton legendBtnRef={null} />)

    expect(container.querySelector('span').textContent).toEqual('legend title')
  })

  it('should not display legend button', () => {
    const dispatch = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      dispatch,
      isDesktop: false,
      isEditMode: false,
      mode: null,
      legend: { title: 'legend title' },
      activePanel: 'LEGEND'
    })

    const { container } = render(<LegendButton legendBtnRef={null} />)

    expect(container.querySelector('button').style.display).toEqual('none')
  })

  it.each([
    // [legend, isQueryMode, isDesktop, isLegendInset, description]
    [false, false, false, false, 'when legend is false'],
    [false, false, false, true, 'when legend is false'],
    [false, true, false, false, 'when legend is false'],
    [false, true, false, true, 'when legend is false'],
    [true, true, false, false, 'when in query mode'],
    [true, true, false, true, 'when in query mode'],
    [true, true, true, false, 'when in query mode'],
    [true, true, true, true, 'when in query mode'],
    [true, false, true, false, 'when desktop and not legend inset']
  ])('should return null %s', (legend, isQueryMode, isDesktop, isLegendInset, description) => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options: {
        id: 'test',
        legend
      },
      isQueryMode,
      isDesktop,
      isLegendInset
    })

    const { container } = render(<LegendButton legendBtnRef={mockLegendBtnRef} />)
    expect(container.firstChild).toBeNull()
  })
})
