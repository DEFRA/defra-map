import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Autocomplete from '../../src/js/components/autocomplete'
import { debounce } from '../../src/js/lib/debounce'

jest.mock('../../src/js/lib/debounce', () => ({
  debounce: jest.fn((fn) => fn)
}))

describe('autocomplete', () => {
  let dispatchMock, geocodeMock, updateViewportMock

  beforeEach(() => {
    dispatchMock = jest.fn()
    geocodeMock = {
      suggest: jest.fn().mockResolvedValue([
        { id: '1', text: 'Suggestion 1', marked: { __html: 'Suggestion 1' } },
        { id: '2', text: 'Suggestion 2', marked: { __html: 'Suggestion 2' } }
      ])
    }
    updateViewportMock = jest.fn()

    jest.mocked(debounce).mockImplementation((fn) => fn)
  })

  const renderComponent = (stateOverrides = {}) => {
    const state = {
      value: '',
      selected: 0,
      status: 'Loading...',
      isVisible: true,
      suggestions: [],
      ...stateOverrides
    }

    render(
      <Autocomplete
        id='test-id'
        state={state}
        dispatch={dispatchMock}
        geocode={geocodeMock}
        updateViewport={updateViewportMock}
      />
    )
  }

  it('should render autocomplete component', () => {
    renderComponent()
    const autocompleteElement = screen.getByRole('listbox')
    expect(autocompleteElement).toBeTruthy()
  })

  it('should render status message correctly', () => {
    renderComponent()
    const statusElement = screen.getByText('Loading...', { selector: '[aria-live="polite"]' })
    expect(statusElement).toBeTruthy()
  })

  it('should render suggestions list correctly', () => {
    renderComponent({
      suggestions: [
        { id: '1', text: 'Suggestion 1', marked: { __html: 'Suggestion 1' } },
        { id: '2', text: 'Suggestion 2', marked: { __html: 'Suggestion 2' } }
      ]
    })

    const suggestions = screen.queryAllByRole('option', { hidden: true })

    expect(suggestions.length).toBe(2)
    expect(suggestions[0]).toHaveTextContent('Suggestion 1')
    expect(suggestions[1]).toHaveTextContent('Suggestion 2')
  })

  it('should hide suggestions list when state.isVisible is false', () => {
    renderComponent({ isVisible: false })
    const suggestionsList = screen.getByRole('listbox', { hidden: true })
    expect(suggestionsList).not.toBeVisible()
  })

  it('should call debounceUpdateSuggest when input value length is greater than or equal to MIN_SEARCH_LENGTH', () => {
    renderComponent({ value: 'test' })
    expect(geocodeMock.suggest).toHaveBeenCalledWith('test')
  })

  it('should call updateStatus when input value length is less than MIN_SEARCH_LENGTH', () => {
    renderComponent({ value: 'te' })
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'CLEAR_STATUS' })
  })
})
