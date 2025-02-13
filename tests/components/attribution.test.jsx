import React from 'react'
import { render, screen } from '@testing-library/react'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import Attribution from '../../src/js/components/attribution'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders wrapper div always', () => {
  useApp.mockReturnValue({ isMobile: false })
  useViewport.mockReturnValue({ style: { attribution: 'Test Attribution' } })

  const { container } = render(<Attribution />)
  expect(container.querySelector('.fm-o-attribution')).not.toBeNull()
})

test('renders attribution when isMobile is false and attribution exists', () => {
  useApp.mockReturnValue({ isMobile: false })
  useViewport.mockReturnValue({ style: { attribution: 'Test Attribution' } })

  render(<Attribution />)
  expect(screen.getByText(/Test Attribution/i)).not.toBeNull()
})

test('does not render attribution when isMobile is true', () => {
  useApp.mockReturnValue({ isMobile: true })
  useViewport.mockReturnValue({ style: { attribution: 'Test Attribution' } })

  const { container } = render(<Attribution />)
  expect(container.querySelector('.fm-c-attribution')).toBeNull()
})

test('does not render attribution when attribution is missing', () => {
  useApp.mockReturnValue({ isMobile: false })
  useViewport.mockReturnValue({ style: { attribution: null } })

  const { container } = render(<Attribution />)
  expect(container.querySelector('.fm-c-attribution')).toBeNull()
})
