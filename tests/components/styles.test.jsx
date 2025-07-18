import React from 'react'
import { fireEvent, render, screen, act } from '@testing-library/react'

import Styles from '../../src/js/components/styles'

import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('styles', () => {
  const appDispatch = jest.fn()
  const viewportDispatch = jest.fn()

  jest.mocked(useViewport).mockReturnValue({
    dispatch: viewportDispatch,
    size: 'small',
    style: {
      attribution: 'Test',
      name: 'default',
      url: 'https://test/default/styles.json'
    },
    styles: [
      {
        name: 'default',
        attribution: 'Test',
        url: 'https://test/default/styles.json',
        iconUrl: 'testUrl'
      },
      {
        name: 'dark',
        attribution: 'Test',
        url: 'https://test/dark/styles.json'
      },
      {
        name: 'aerial',
        attribution: 'Test',
        url: 'https://test/aerial/styles.json',
        logo: null
      },
      {
        name: 'deuteranopia',
        attribution: 'Test',
        url: 'https://test/deuteranopia/styles.json',
        displayName: 'Red-green colour deficiency'
      },
      {
        name: 'tritanopia',
        attribution: 'Test',
        url: 'https://test/tritanopia/styles.json'
      },
      {
        name: 'no-display-name',
        attribution: 'Test',
        url: 'https://test/no-display-name/styles.json'
      }

    ]
  })

  beforeEach(() => {
    global.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render 3 available styles', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      options: {
        id: 'map',
        hasAutoMode: true
      }
    })

    const { container } = render(<Styles />)

    expect(container.querySelectorAll('.fm-c-layers__columns:first-child .fm-c-layers__item').length).toEqual(3)
    expect(container.querySelector('.fm-c-layers__more')).toBeTruthy()
    expect(screen.getByText(/Default/)).toBeTruthy()
    expect(screen.getByText(/Dark/)).toBeTruthy()
    expect(screen.getByText(/Aerial/)).toBeTruthy()
    expect((container.querySelector('button[value="default"] img')).src).toEqual('http://localhost/testUrl')
    expect((container.querySelector('button[value="dark"] img')).src).toEqual('')
  })

  it('should render all styles and text sizes on clicking "More styles"', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef: {
        current: document.body
      },
      options: {
        id: 'map',
        hasAutoMode: true
      }
    })

    const { container } = render(<Styles />)

    fireEvent.click(container.querySelector('.fm-c-btn-more'))

    act(() => {
      expect(container.querySelectorAll('.fm-c-layers__item').length).toEqual(9)
      expect(container.querySelector('.fm-c-btn-more')).toBeFalsy()
      expect(screen.getByText(/Small/)).toBeTruthy()
      expect(screen.getByText(/Medium/)).toBeTruthy()
      expect(screen.getByText(/Large/)).toBeTruthy()
    })
  })

  it('should fire dispatch event on style click', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef: {
        current: document.body
      },
      options: {
        id: 'map',
        hasAutoMode: true
      }
    })

    const { container } = render(<Styles />)

    fireEvent.click(container.querySelector('.fm-c-btn-more'))
    fireEvent.click(container.querySelectorAll('.fm-c-layers__button')[0])
    fireEvent.click(container.querySelectorAll('.fm-c-layers__button')[6])
    expect(screen.getByText(/Red-green colour deficiency/)).toBeTruthy()
    expect(screen.getByText(/no-display-name/)).toBeTruthy()

    act(() => {
      expect(viewportDispatch).toHaveBeenCalledTimes(2)
    })
  })
})
