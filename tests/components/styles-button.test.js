import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StylesButton from '../../src/js/components/styles-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('styles-button', () => {
  it('should show styles button', () => {
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id',
        styles: [{}, {}]
      }
    })

    render(<StylesButton />)

    expect(screen.getByText('Choose map style')).toBeTruthy()
  })

  it('should dispatch OPEN action on click', () => {
    const dispatchMock = jest.fn()
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id',
        styles: [{}, {}]
      },
      dispatch: dispatchMock
    })

    render(<StylesButton />)

    const button = document.querySelector('.fm-c-btn--style')
    fireEvent.click(button)

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'OPEN', payload: 'STYLE' })
  })

  it('should contain the id in the button', () => {
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id',
        styles: [{}, {}]
      }
    })

    render(<StylesButton />)

    const button = screen.getByRole('button')

    expect(button.getAttribute('aria-labelledby')).toBe('test-id-style-label')
  })
})
