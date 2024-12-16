import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchButton from '../../src/js/components/search-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('search-button', () => {
  it('should show search button', () => {
    jest.mocked(useApp).mockReturnValue({
      isDesktop: true,
      options: { id: 'test-id' },
      search: {},
      mode: null
    })

    render(<SearchButton />)

    expect(screen.getByText('Search')).toBeTruthy()
  })

  it('should dispatch OPEN action on click', () => {
    const dispatchMock = jest.fn()
    jest.mocked(useApp).mockReturnValue({
      options: { id: 'test-id' },
      search: {},
      activePanel: null,
      dispatch: dispatchMock,
      mode: null
    })

    render(<SearchButton />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'OPEN', payload: 'SEARCH' })
  })

  it('should hide button when activePanel is SEARCH', () => {
    jest.mocked(useApp).mockReturnValue({
      options: { id: 'test-id' },
      search: {},
      activePanel: 'SEARCH',
      mode: null
    })

    render(<SearchButton />)

    const button = screen.queryByRole('button')
    expect(button).toBeNull()
  })
})
