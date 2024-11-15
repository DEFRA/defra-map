import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import LegendButton from '../../src/js/components/legend-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('legend-button', () => {
  it('should handle click', () => {
    const dispatch = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      dispatch,
      isMobile: false,
      isEditMode: false,
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
      isMobile: false,
      isEditMode: false,
      legend: { title: 'legend title' }
    })

    const { container } = render(<LegendButton legendBtnRef={null} />)

    expect(container.querySelector('span').textContent).toEqual('legend title')
    // expect(container.querySelector('button').getAttribute('aria-label')).toEqual('legend title')
  })

  it('should not display legend button', () => {
    const dispatch = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      dispatch,
      isMobile: false,
      isEditMode: false,
      legend: { title: 'legend title' },
      activePanel: 'LEGEND'
    })

    const { container } = render(<LegendButton legendBtnRef={null} />)

    expect(container.querySelector('button').style.display).toEqual('none')
  })
})
