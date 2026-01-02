import React from 'react'
import { render, screen } from '@testing-library/react'
import { Actions } from './Actions.jsx'

// Create a simple component to accept the isHidden prop
const TestChild = ({ isHidden, children, ...props }) => {
  return <div {...props}>{children}</div>
}

describe('Actions component', () => {
  it('renders the correct slot-based class', () => {
    render(<Actions slot='actions'>Content</Actions>)
    const container = screen.getByText('Content').closest('div')
    expect(container).toHaveClass('dm-c-actions', 'dm-c-panel')
  })

  it('renders children correctly', () => {
    render(
      <Actions slot='actions'>
        <div data-testid='child'>Child Content</div>
      </Actions>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('child').textContent).toBe('Child Content')
  })

  it('hides the container when all children are hidden', () => {
    render(
      <Actions slot="actions">
        <TestChild isHidden={true} data-testid="child1">Child 1</TestChild>
        <TestChild isHidden={true} data-testid="child2">Child 2</TestChild>
      </Actions>
    )

    const container = screen.getByTestId('child1').closest('.dm-c-actions')
    expect(container).toHaveStyle('display: none')
  })

  it('shows the container when at least one child is visible', () => {
    render(
      <Actions slot="actions">
        <TestChild isHidden={false} data-testid="child1">Child 1</TestChild>
        <TestChild isHidden={true} data-testid="child2">Child 2</TestChild>
      </Actions>
    )

    const container = screen.getByTestId('child1').closest('.dm-c-actions')
    expect(container).not.toHaveStyle('display: none')
  })
})