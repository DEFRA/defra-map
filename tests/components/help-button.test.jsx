import React from 'react'
import { render, screen } from '@testing-library/react'

import HelpButton from '../../src/js/components/help-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('help-button', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  const helpURL = 'https://example.com/'

  it('should show an anchor that links to helpURL', () => {
    jest.mocked(useApp).mockReturnValue({ options: { id: 'test', helpURL } })
    const { container } = render(<HelpButton />)
    // It should be an anchor with href equal to the passed helpURL
    expect(container.querySelector('a').href).toEqual(helpURL)
    // It should contain an svg
    expect(container.querySelector('a svg')).not.toEqual(null)
    expect(screen.getByText('Help')).toBeTruthy()
  })

  it('should not show an anchor if helpURL is not defined', () => {
    jest.mocked(useApp).mockReturnValue({ options: { id: 'test' } })

    const { container } = render(<HelpButton />)
    expect(container.querySelector('a')).toEqual(null)
  })
})
