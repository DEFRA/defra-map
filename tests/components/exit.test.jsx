import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import Exit from '../../src/js/components/exit'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('exit', () => {
  it('should handle exit', () => {
    const handleExit = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      handleExit,
      isDesktop: true,
      isBack: false,
      options: { legend: { display: 'inset ' } }
    })

    const { container } = render(<Exit />)

    fireEvent.click(screen.getByText('Exit'))

    expect(handleExit).toHaveBeenCalled()
    expect(container.querySelector('svg').getAttribute('width')).toEqual('20')
    expect(container.querySelector('svg').getAttribute('viewBox')).toEqual('0 0 20 20')
  })

  it('should handle back', () => {
    const handleExit = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      handleExit,
      isDesktop: true,
      isBack: true,
      options: { legend: { display: 'inset ' } }
    })

    const { container } = render(<Exit />)

    fireEvent.click(screen.getByText('Back'))

    expect(handleExit).toHaveBeenCalled()
    expect(container.querySelector('svg').getAttribute('width')).toEqual('14')
    expect(container.querySelector('svg').getAttribute('viewBox')).toEqual('0 0 14 20')
  })
})
