// src/components/Logo.test.jsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Logo } from './Logo'
import { useMap } from '../../store/mapContext'

jest.mock('../../store/mapContext', () => ({
  useMap: jest.fn()
}))

describe('Logo', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when mapStyle is missing', () => {
    useMap.mockReturnValue({ mapStyle: null })

    const { container } = render(<Logo />)
    expect(container.firstChild).toBeNull()
  })

  it('renders logo image when mapStyle is available', () => {
    useMap.mockReturnValue({
      mapStyle: {
        logo: '/test-logo.png',
        logoAltText: 'Test Logo'
      }
    })

    render(<Logo />)

    const img = screen.getByRole('img', { name: 'Test Logo' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test-logo.png')
    expect(img).toHaveAttribute('alt', 'Test Logo')
  })
})
