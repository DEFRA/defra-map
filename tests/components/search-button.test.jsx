import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchButton from '../../src/js/components/search-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('search-button', () => {
  it('should show search button', () => {
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id'
      }
    })

    render(<SearchButton />)

    expect(screen.getByText('Search')).toBeTruthy()
  })

  it('should dispatch OPEN action on click', () => {
    const dispatchMock = jest.fn()
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id'
      },
      activePanel: null,
      dispatch: dispatchMock
    })

    render(<SearchButton />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'OPEN', payload: 'SEARCH' })
  })

  it('should hide button when activePanel is SEARCH', () => {
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id'
      },
      activePanel: 'SEARCH'
    })

    render(<SearchButton />)

    const button = screen.queryByRole('button')
    expect(button).toBeNull()
  })
})
