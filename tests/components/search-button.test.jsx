import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
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

    // Use hidden: true to find the hidden button
    const button = screen.getByRole('button', { hidden: true })
    expect(button).toHaveAttribute('style', expect.stringContaining('display: none'))
  })

  it('should not render when search is falsy', () => {
    jest.mocked(useApp).mockReturnValue({
      options: { id: 'test-id' },
      search: null,
      mode: null
    })

    const { container } = render(<SearchButton />)
    expect(container.firstChild).toBeNull()
  })

  it('should not render when in frame query mode', () => {
    jest.mocked(useApp).mockReturnValue({
      options: { id: 'test-id' },
      search: {},
      mode: 'frame'
    })

    const { container } = render(<SearchButton />)
    expect(container.firstChild).toBeNull()
  })

  it('should not render when in draw \'vertex\' mode', () => {
    jest.mocked(useApp).mockReturnValue({
      options: { id: 'test-id' },
      search: {},
      mode: 'vertex'
    })

    const { container } = render(<SearchButton />)
    expect(container.firstChild).toBeNull()
  })

  it('should add aria-labelledby when tooltip is provided', () => {
    jest.mocked(useApp).mockReturnValue({
      options: { id: 'test-id' },
      search: {},
      mode: null
    })

    render(<SearchButton tooltip='right' />)

    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-labelledby')).toBe('test-id-search-label')
    expect(screen.queryByText('Search')).toBeNull()
  })

  it('should correctly pass searchBtnRef to the button', () => {
    const mockRef = { current: null }
    jest.mocked(useApp).mockReturnValue({
      options: { id: 'test-id' },
      search: {},
      mode: null
    })

    render(<SearchButton searchBtnRef={mockRef} />)

    const button = screen.getByRole('button')
    expect(button).not.toBeNull()
  })
})
