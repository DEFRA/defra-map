import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import HelpButton from '../../src/js/components/help-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('help-button', () => {
  it('should show button', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: jest.fn(),
      activePanel: null,
      isDesktop: false,
      mode: 'frame'
    })

    render(<HelpButton />)

    expect(screen.getByText('Help')).toBeTruthy()
  })

  it('should not display button', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: jest.fn(),
      activePanel: 'HELP',
      isDesktop: false,
      mode: 'frame'
    })

    const { container } = render(<HelpButton />)

    expect(container.querySelector('button').style.display).toEqual('none')
  })

  it('should handle click', () => {
    const dispatch = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      dispatch,
      activePanel: null,
      isDesktop: false,
      mode: 'frame'
    })

    render(<HelpButton />)

    fireEvent.click(screen.getByText('Help'))

    expect(dispatch).toHaveBeenCalled()
  })
})
