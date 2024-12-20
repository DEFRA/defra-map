import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import KeyButton from '../../src/js/components/key-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('key-button', () => {
  beforeEach(() => {
    jest.mocked(useApp).mockReturnValue({
      activePanel: null,
      options: { legend: { key: {} } },
      mode: null,
      dispatch: jest.fn()
    })
  })

  it('should render key button', () => {
    render(<KeyButton />)
    const keyButton = screen.getByRole('button', { name: /key/i })
    expect(keyButton).toBeTruthy()
  })

  it('should dispatch OPEN action on click', () => {
    const dispatchMock = jest.fn()
    jest.mocked(useApp).mockReturnValue({
      activePanel: null,
      options: { legend: { key: {} } },
      mode: null,
      dispatch: dispatchMock
    })

    render(<KeyButton />)

    const keyButton = screen.getByRole('button', { name: /key/i })
    fireEvent.click(keyButton)

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'OPEN', payload: 'KEY' })
  })

  it('should hide button when activePanel is KEY', () => {
    jest.mocked(useApp).mockReturnValue({
      activePanel: 'KEY',
      options: { legend: { key: {} } },
      mode: null,
      dispatch: jest.fn()
    })

    const { container } = render(<KeyButton />)

    const keyButton = container.querySelector('.fm-c-btn--key')

    expect(keyButton).toHaveStyle('display: none;')
  })
})
