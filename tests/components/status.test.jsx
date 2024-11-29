import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Status from '../../src/js/components/status'

describe('status', () => {
  it('should render status message', () => {
    render(<Status message='Online' isVisuallyHidden={false} />)
    const statusElement = screen.getByText('Online')
    expect(statusElement).toBeTruthy()
  })

  it('should be visually hidden when isVisuallyHidden is true', () => {
    render(<Status message='Online' isVisuallyHidden />)
    const statusElement = screen.getByText('Online').closest('.fm-c-status')
    expect(statusElement).toHaveClass('fm-c-status--visually-hidden')
  })

  it('should be visually hidden when message is not provided', () => {
    render(<Status message='' isVisuallyHidden={false} />)
    const statusElement = screen.getByText((_, el) =>
      el.classList.contains('fm-c-status')
    )
    expect(statusElement).toHaveClass('fm-c-status--visually-hidden')
  })

  it('should not be visually hidden when isVisuallyHidden is false and message is provided', () => {
    render(<Status message='Online' isVisuallyHidden={false} />)
    const statusElement = screen.getByText('Online').closest('div.fm-c-status')
    expect(statusElement).not.toHaveClass('fm-c-status--visually-hidden')
  })
})
