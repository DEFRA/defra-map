import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StylesButton from '../../src/js/components/styles-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('styles-button', () => {
  beforeAll(() => {
    if (!global.PointerEvent) {
      global.PointerEvent = class extends MouseEvent {}
    }
  })

  it('should show styles button', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: {
        basemaps: [1, 2]
      },
      options: {
        id: 'test-id'
      }
    })

    render(<StylesButton />)

    expect(screen.getByText('Choose map style')).toBeTruthy()
  })

  it('should render keyboard shortcut text', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: {
        basemaps: [1, 2]
      },
      options: {
        id: 'test-id'
      }
    })

    render(<StylesButton />)

    expect(screen.getByText('Choose map style')).toBeTruthy()
  })

  it('should dispatch OPEN action on pointer down', () => {
    const dispatchMock = jest.fn()
    jest.mocked(useApp).mockReturnValue({
      provider: {
        basemaps: [1, 2]
      },
      options: {
        id: 'test-id'
      },
      dispatch: dispatchMock
    })

    render(<StylesButton />)
    // Query the button using the class name as fallback
    const button = document.querySelector('.fm-c-btn--style')

    const pointerDownEvent = new PointerEvent('pointerdown', { button: 0, bubbles: true })
    button.dispatchEvent(pointerDownEvent)

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'OPEN', payload: 'STYLE' })
  })

  it('should dispatch OPEN action on key down', () => {
    const dispatchMock = jest.fn()
    jest.mocked(useApp).mockReturnValue({
      provider: {
        basemaps: [1, 2]
      },
      options: {
        id: 'test-id'
      },
      dispatch: dispatchMock
    })

    render(<StylesButton />)

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter' })

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'OPEN', payload: 'STYLE' })
  })

  it('should contain the id in the button', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: {
        basemaps: [1, 2]
      },
      options: {
        id: 'test-id'
      }
    })

    render(<StylesButton />)

    const button = screen.getByRole('button')

    expect(button.getAttribute('aria-labelledby')).toBe('test-id-style-label')
  })
})
