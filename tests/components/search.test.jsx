import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'

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
})
