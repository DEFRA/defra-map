import React from 'react'
import { render, screen } from '@testing-library/react'

import HelpButton from '../../src/js/components/help-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('help-button', () => {
  it('should show button', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: jest.fn(),
      activePanel: null,
      isDesktop: false,
      options: { id: 'test', queryArea: { helpURL: 'http://test.org' } },
      drawMode: 'frame'
    })

    render(<HelpButton />)

    expect(screen.getByText('Help')).toBeTruthy()
  })

  it('should not display button when no url provided', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: jest.fn(),
      activePanel: 'HELP',
      isDesktop: false,
      options: { id: 'test', queryArea: { helpURL: null } },
      drawMode: 'frame'
    })

    render(<HelpButton />)

    expect(screen.queryByText('Help')).toBeFalsy()
  })
})
