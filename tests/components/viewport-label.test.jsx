import React from 'react'
import { render, screen } from '@testing-library/react'
import ViewportLabel from '../../src/js/components/viewport-label'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('viewport-label', () => {
  it('should show viewport label', () => {
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id'
      }
    })

    render(<ViewportLabel />)

    expect(screen.getByText('Interactive map.')).toBeTruthy()
  })

  it('should contain viewport id in the div', () => {
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id'
      }
    })

    const { container } = render(<ViewportLabel />)

    const div = container.querySelector('div')

    const divId = div.id

    expect(divId).toBe('test-id-viewport-label')
  })
  it('shoud render keyboard shortcut text', () => {
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id'
      }
    })

    render(<ViewportLabel />)

    expect(screen.getByText('Alt')).toBeTruthy()
    expect(screen.getByText('K')).toBeTruthy()
  })
})
