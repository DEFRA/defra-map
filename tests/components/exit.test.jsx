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
      isPage: true,
      mode: null
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
      isPage: true,
      isBack: true,
      mode: null
    })

    const { container } = render(<Exit />)

    fireEvent.click(screen.getByText('Back'))

    expect(handleExit).toHaveBeenCalled()
    expect(container.querySelector('svg').getAttribute('width')).toEqual('14')
    expect(container.querySelector('svg').getAttribute('viewBox')).toEqual('0 0 14 20')
  })

  it('should return null when in query mode', () => {
    const handleExit = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      handleExit,
      isDesktop: true,
      isBack: false,
      isPage: true,
      mode: 'frame'
    })

    const { container } = render(<Exit />)
    expect(container.firstChild).toBeNull()
  })

  it('should return null when not in page mode', () => {
    const handleExit = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      handleExit,
      isDesktop: true,
      isBack: false,
      isPage: false,
      mode: null
    })

    const { container } = render(<Exit />)
    expect(container.firstChild).toBeNull()
  })
})
