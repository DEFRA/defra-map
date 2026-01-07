import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import ScaleBar from '../../src/js/components/scale-bar'
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('ScaleBar', () => {
  it('should render null if options.scaleBar is not set', async () => {
    jest.mocked(useApp).mockReturnValue({ options: { } })
    jest.mocked(useViewport).mockReturnValue({})
    const { container } = render(<ScaleBar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render hidden if isReady is not true', async () => {
    jest.mocked(useApp).mockReturnValue({ options: { scaleBar: 'metric' } })
    jest.mocked(useViewport).mockReturnValue({})
    const { container } = render(<ScaleBar />)
    expect(screen.getByText('Scale bar:')).toBeInTheDocument()
    expect(container.querySelectorAll('.fm-u-hidden').length).toBe(1)
  })

  it('should render if isReady is true and resolution is set', async () => {
    jest.mocked(useApp).mockReturnValue({ options: { scaleBar: 'metric' } })
    jest.mocked(useViewport).mockReturnValue({ resolution: 100, isReady: true })
    const { container } = render(<ScaleBar />)
    expect(screen.getByText('Scale bar:')).toBeInTheDocument()
    expect(container.querySelectorAll('.fm-u-hidden').length).toBe(0)
  })
})
