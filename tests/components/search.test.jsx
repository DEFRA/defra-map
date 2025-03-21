import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { initialState } from '../../src/js/store/search-reducer'
import Search from '../../src/js/components/search'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import OsProvider from '../../src/js/provider/os-open-names/provider.js'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/provider/os-open-names/provider.js')

describe('Search', () => {
  const transformSearchRequest = jest.fn()
  const viewportDispatch = jest.fn()
  const appDispatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    document.body.innerHTML = '<button id="test-button">open search</button>'

    // Mock useViewport
    jest.mocked(useViewport).mockReturnValue({
      viewportDispatch
    })
    // Mock useApp with all required properties including dispatch
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      interfaceType: 'keyboard',
      isMobile: true,
      activePanel: 'SEARCH',
      activeRef: {
        current: document.body
      },
      options: { id: 'test' },
      search: {
        isAutocomplete: false,
        value: 'test value'
      },
      isDesktop: false,
      legend: {
        width: 300,
        keyWidth: 300
      }
    })
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should render desktop view component', () => {
    jest.mocked(useViewport).mockReturnValue({
      viewportDispatch
    })

    jest.mocked(useApp).mockReturnValue({
      interfaceType: null,
      isMobile: false,
      activePanel: 'SEARCH',
      activeRef: {},
      options: {
        id: 'test',
        transformSearchRequest
      },
      search: {
        isAutocomplete: false
      },
      legend: {
        width: 300,
        keyWidth: 300
      }
    })

    const { container } = render(<Search instigatorRef={null} />)

    expect(container.querySelector('.fm-c-btn--search-back')).toBeFalsy()
    expect(container.querySelector('.fm-c-btn--search-close')).toBeTruthy()
    expect(container.querySelector('#test-search-form')).toBeTruthy()
    expect(container.querySelector('input[aria-controls="test-suggestions"')).toBeTruthy()
  })

  it('should render mobile view component', () => {
    jest.mocked(useViewport).mockReturnValue({
      viewportDispatch
    })

    jest.mocked(useApp).mockReturnValue({
      interfaceType: null,
      isMobile: true,
      activePanel: 'SEARCH',
      activeRef: {},
      options: {
        id: 'test',
        transformSearchRequest
      },
      search: {
        isAutocomplete: false
      },
      legend: {
        width: 300,
        keyWidth: 300
      }
    })

    const { container } = render(<Search instigatorRef={null} />)

    expect(container.querySelector('.fm-c-btn--search-back')).toBeTruthy()
    expect(container.querySelector('.fm-c-btn--search-close')).toBeFalsy()
  })

  it('should show autocomplete', () => {
    jest.mocked(useViewport).mockReturnValue({
      viewportDispatch
    })

    jest.mocked(useApp).mockReturnValue({
      interfaceType: null,
      isMobile: false,
      activePanel: 'SEARCH',
      activeRef: {},
      options: {
        id: 'test',
        transformSearchRequest
      },
      search: {
        isAutocomplete: true
      },
      legend: {
        width: 300,
        keyWidth: 300
      }
    })

    const { container } = render(<Search instigatorRef={null} />)

    expect(container.querySelector('.fm-c-search__suggestions')).toBeTruthy()
  })

  it('should handle submit', async () => {
    jest.mocked(useViewport).mockReturnValue({
      dispatch: viewportDispatch
    })

    jest.mocked(useApp).mockReturnValue({
      interfaceType: null,
      isMobile: false,
      activePanel: 'SEARCH',
      activeRef: {},
      options: {
        id: 'test',
        transformSearchRequest
      },
      search: {
        isAutocomplete: false
      },
      legend: {
        width: 300,
        keyWidth: 300
      }
    })

    const mockGeocodeFind = jest.fn().mockResolvedValue({
      bounds: 0,
      center: 0,
      zoom: 0,
      text: 'london'
    })

    OsProvider.mockImplementation(() => {
      return {
        find: mockGeocodeFind
      }
    })

    const { container } = render(<Search instigatorRef={null} />)

    act(() => {
      container.querySelector('form').submit()
    })

    await waitFor(() => {
      expect(viewportDispatch).toHaveBeenCalled()
      expect(mockGeocodeFind).toHaveBeenCalled()
    })
  })
  it('should collapse when close search button is clicked', () => {
    jest.mocked(useViewport).mockReturnValue({
      viewportDispatch
    })

    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      interfaceType: null,
      isMobile: false,
      activePanel: 'SEARCH',
      activeRef: {
        current: document.body
      },
      options: {
        id: 'test',
        transformSearchRequest
      },
      search: {
        isAutocomplete: false
      },
      legend: {
        width: 300,
        keyWidth: 300
      }
    })

    const { container } = render(
      <>
        <button id='test-button'>open search</button>
        <Search instigatorRef={{ current: document.querySelector('#test-button') }} />
      </>
    )

    act(() => {
      fireEvent.click(container.querySelector('.fm-c-btn--search-close'))
      expect(appDispatch).toHaveBeenCalled()
    })
  })

  it('should handle Escape key press correctly', () => {
    const { container } = render(
      <Search instigatorRef={{ current: document.querySelector('#test-button') }} />
    )
    const input = container.querySelector('input')

    fireEvent.keyUp(input, { key: 'Escape' })
    expect(appDispatch).toHaveBeenCalledWith({ type: 'CLOSE' })
  })

  it('should not collapse search when other keys are pressed', () => {
    const { container } = render(
      <Search instigatorRef={{ current: document.querySelector('#test-button') }} />
    )
    const input = container.querySelector('input')

    fireEvent.keyUp(input, { key: 'Enter' })
    expect(appDispatch).not.toHaveBeenCalled()
  })
  it('should return null when conditions for hasPanel are not met', () => {
    // Mock useApp with values that would make hasPanel return false
    jest.mocked(useApp).mockReturnValue({
      interfaceType: null,
      isMobile: false,
      activePanel: null, // Setting activePanel to null should trigger the condition
      activeRef: {},
      options: {
        id: 'test',
        transformSearchRequest
      },
      search: {
        isAutocomplete: false
      },
      isDesktop: true,
      legend: {
        width: 300,
        keyWidth: 300
      }
    })

    const { container } = render(<Search instigatorRef={null} />)

    // The component should return null, so nothing should be rendered
    expect(container.firstChild).toBeNull()
  })

  it('should return early if geocode.find returns no location', async () => {
    // Mock the find method to return null
    const mockFind = jest.fn().mockResolvedValue(null)

    // Mock the OsProvider class implementation
    OsProvider.mockImplementation(() => ({
      find: mockFind
    }))

    // Create state with a selected suggestion
    const stateWithSuggestion = {
      ...initialState,
      value: 'test location',
      selected: 0,
      suggestions: [{
        id: '123',
        text: 'test location'
      }]
    }

    // Mock dispatch function
    const mockDispatch = jest.fn()

    // Mock useApp hook with necessary values
    jest.mocked(useApp).mockReturnValue({
      interfaceType: 'keyboard',
      isMobile: false,
      options: {
        id: 'test',
        transformSearchRequest: jest.fn()
      },
      search: {
        isAutocomplete: true,
        isExpanded: true
      },
      activePanel: 'SEARCH',
      activeRef: { current: null },
      isDesktop: true,
      legend: {},
      dispatch: jest.fn()
    })

    // Mock useViewport hook
    jest.mocked(useViewport).mockReturnValue({
      dispatch: viewportDispatch
    })

    // Mock useReducer to use our state with suggestion
    jest.spyOn(React, 'useReducer').mockImplementation(() => [stateWithSuggestion, mockDispatch])

    // Render the component
    const { container } = render(
      <Search instigatorRef={{ current: null }} />
    )

    // Get the input and set its value
    const input = container.querySelector('input')
    fireEvent.change(input, { target: { value: 'test location' } })

    // Submit the form
    const form = container.querySelector('form')
    await act(async () => {
      fireEvent.submit(form, {
        preventDefault: () => {}
      })
    })

    // Verify the mock was called with both value and suggestionId
    expect(mockFind).toHaveBeenCalledWith('test location', undefined)

    // Verify viewportDispatch was not called since location was null
    expect(viewportDispatch).not.toHaveBeenCalled()
  })
})
