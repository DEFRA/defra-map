import React from 'react'
import { render, screen } from '@testing-library/react'
import { Actions } from './Actions.jsx'

describe('Actions component', () => {
  it('renders the correct slot-based class', () => {
    render(<Actions slot="actions-inset">Content</Actions>)
    const container = screen.getByText('Content').closest('div')
    expect(container).toHaveClass('am-c-actions-inset', 'am-c-panel')
  })

  it('renders children correctly', () => {
    render(
      <Actions slot="actions-bottom">
        <div data-testid="child">Child Content</div>
      </Actions>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('child').textContent).toBe('Child Content')
  })
})
