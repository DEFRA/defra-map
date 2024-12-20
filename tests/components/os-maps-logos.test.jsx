import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DefaultLogo } from '../../src/js/components/os-maps-logos'

describe('DefaultLogo', () => {
  test('renders correctly', () => {
    const { getByRole } = render(<DefaultLogo />)
    const svgElement = getByRole('img', { name: /ordnance survey logo/i })
    expect(svgElement).toBeInTheDocument()
    expect(svgElement).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    expect(svgElement).toHaveAttribute('width', '90')
    expect(svgElement).toHaveAttribute('height', '24')
  })
})
