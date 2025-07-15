import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StylesButton from '../../src/js/components/styles-button'
import { useApp } from '../../src/js/store/use-app'
import '@testing-library/jest-dom'

jest.mock('../../src/js/store/use-app')

describe('styles-button', () => {
  const mockDispatch = jest.fn()
  const mockStylesBtnRef = { current: null }

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

  it('should return null when styles array is empty', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options: {
        id: 'test',
        styles: []
      }
    })

    const { container } = render(<StylesButton stylesBtnRef={mockStylesBtnRef} />)
    expect(container.firstChild).toBeNull()
  })

  it('should return null when styles is undefined', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options: {
        id: 'test'
      }
    })

    const { container } = render(<StylesButton stylesBtnRef={mockStylesBtnRef} />)
    expect(container.firstChild).toBeNull()
  })

  it('should return null when styles array has only one item', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options: {
        id: 'test',
        styles: ['style1']
      }
    })

    const { container } = render(<StylesButton stylesBtnRef={mockStylesBtnRef} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render button when styles array has multiple items', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options: {
        id: 'test',
        styles: ['style1', 'style2']
      }
    })

    render(<StylesButton stylesBtnRef={mockStylesBtnRef} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('fm-c-btn', 'fm-c-btn--style')
    expect(button).toHaveAttribute('aria-labelledby', 'test-style-label')
  })

  it('should render tooltip with correct props', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options: {
        id: 'test',
        styles: ['style1', 'style2']
      }
    })

    render(<StylesButton stylesBtnRef={mockStylesBtnRef} />)

    const tooltip = screen.getByText('Choose map style')
    expect(tooltip).toBeInTheDocument()
  })

  it('should render SVG icon with correct attributes', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options: {
        id: 'test',
        styles: ['style1', 'style2']
      }
    })

    render(<StylesButton stylesBtnRef={mockStylesBtnRef} />)

    const svg = document.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('focusable')).toBe('false')
    expect(svg.getAttribute('width')).toBe('20')
    expect(svg.getAttribute('height')).toBe('20')
    expect(svg.getAttribute('viewBox')).toBe('0 0 20 20')
    expect(svg.getAttribute('fill-rule')).toBe('evenodd')
    expect(svg.getAttribute('stroke-linejoin')).toBe('round')
    expect(svg.getAttribute('fill')).toBe('none')
    expect(svg.getAttribute('stroke')).toBe('currentColor')
    expect(svg.getAttribute('stroke-width')).toBe('2')

    // Also test that the SVG paths are rendered correctly
    const paths = svg.querySelectorAll('path')
    expect(paths).toHaveLength(2)
    expect(paths[0]).toHaveAttribute('d', 'M2 18l5-2 6 2 5-2V2l-5 2-6-2-5 2v14z')
    expect(paths[1]).toHaveAttribute('d', 'M7 2v14m6-12v14')
    expect(paths[1]).toHaveAttribute('stroke-linecap', 'round')
  })

  it('should forward ref to button element', () => {
    const ref = { current: null }

    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options: {
        id: 'test',
        styles: ['style1', 'style2']
      }
    })

    render(<StylesButton stylesBtnRef={ref} />)

    const button = screen.getByRole('button')
    expect(ref.current).toBe(button)
  })
})
