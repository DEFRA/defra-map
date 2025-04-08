import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import Tooltip from '../../src/js/components/tooltip'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('tooltip', () => {
  const defaultProps = {
    id: 'test-tooltip',
    position: 'left',
    text: 'Test tooltip',
    cssModifier: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should render and have the modifier classes', () => {
    jest.mocked(useApp).mockReturnValue({
      isKeyboard: true,
      activePanel: null
    })

    const { container } = render(
      <Tooltip
        id='test-tooltip'
        text='hello tooltip'
        cssModifier='test'
        position='left'
      >
        <p id='test-tooltip'>test tooltip</p>
      </Tooltip>
    )

    expect(screen.getByText('test tooltip')).toBeTruthy()
    expect(screen.getByText('hello tooltip')).toBeTruthy()
    expect(container.querySelector('.fm-c-tooltip--left')).toBeTruthy()
    expect(container.querySelector('.fm-c-tooltip--test')).toBeTruthy()
  })

  it('should toggle the tooltip using mouse events', async () => {
    jest.mocked(useApp).mockReturnValue({
      isKeyboard: true,
      activePanel: null
    })

    const { container } = render(
      <Tooltip
        id='test-tooltip'
        text='hello tooltip'
        cssModifier='test'
        position='left'
      >
        <p id='test-tooltip'>test tooltip</p>
      </Tooltip>
    )

    fireEvent.mouseEnter(document.querySelector('.fm-c-tooltip'))

    await waitFor(() => {
      expect(container.querySelector('.fm-c-tooltip--visible')).toBeTruthy()
    })

    fireEvent.mouseLeave(document.querySelector('.fm-c-tooltip'))

    await waitFor(() => {
      expect(container.querySelector('.fm-c-tooltip--visible')).toBeFalsy()
    })
  })

  it('should hide the tooltip using the escape key', async () => {
    jest.mocked(useApp).mockReturnValue({
      isKeyboard: true,
      activePanel: null
    })

    const { container } = render(
      <Tooltip
        id='test-tooltip'
        text='hello tooltip'
        cssModifier='test'
        position='left'
      >
        <p id='test-tooltip'>test tooltip</p>
      </Tooltip>
    )

    fireEvent.mouseEnter(document.querySelector('.fm-c-tooltip'))

    await waitFor(() => {
      expect(container.querySelector('.fm-c-tooltip--visible')).toBeTruthy()
    })

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(container.querySelector('.fm-c-tooltip--visible')).toBeFalsy()
    })
  })
  it('should handle all keyboard events correctly', () => {
    jest.mocked(useApp).mockReturnValue({
      interfaceType: 'keyboard'
    })

    const { container } = render(
      <Tooltip {...defaultProps}>
        <button>Test Button</button>
      </Tooltip>
    )

    const tooltipDiv = container.firstChild

    // Test handleKeyDown
    fireEvent.keyDown(tooltipDiv)
    expect(tooltipDiv.classList.contains('fm-u-focus-within')).toBe(false)

    // Test handleKeyUp
    fireEvent.keyUp(tooltipDiv)
    expect(tooltipDiv.classList.contains('fm-u-focus-within')).toBe(true)

    // Test Escape key handling
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(tooltipDiv.classList.contains('fm-c-tooltip--visible')).toBe(false)

    // Test Esc key handling (for older browsers)
    fireEvent.keyDown(document, { key: 'Esc' })
    expect(tooltipDiv.classList.contains('fm-c-tooltip--visible')).toBe(false)
  })
})
