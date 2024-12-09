import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StylesButton from '../../src/js/components/styles-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('styles-button', () => {
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

  it('should dispatch OPEN action on click', () => {
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

    const button = document.querySelector('.fm-c-btn--style')
    fireEvent.click(button)

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
