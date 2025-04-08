import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import HelpButton from '../../src/js/components/help-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('help-button', () => {
  const mockDispatch = jest.fn()
  const mockHelpBtnRef = { current: null }
  const defaultProps = {
    options: { id: 'test' },
    dispatch: mockDispatch,
    mode: 'frame',
    isMobile: false,
    activePanel: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should show button', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: jest.fn(),
      activePanel: null,
      isDesktop: false,
      options: { id: 'test' },
      mode: 'frame'
    })

    render(<HelpButton />)

    expect(screen.getByText('Help')).toBeTruthy()
  })

  it('should not display button', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: jest.fn(),
      activePanel: 'HELP',
      isDesktop: false,
      options: { id: 'test' },
      mode: 'frame'
    })

    const { container } = render(<HelpButton />)

    expect(container.querySelector('button').style.display).toEqual('none')
  })

  it('should handle click', () => {
    const dispatch = jest.fn()

    jest.mocked(useApp).mockReturnValue({
      dispatch,
      activePanel: null,
      isDesktop: false,
      options: { id: 'test' },
      mode: 'frame'
    })

    render(<HelpButton />)

    fireEvent.click(screen.getByText('Help'))

    expect(dispatch).toHaveBeenCalled()
  })

  it('should return null when not in query mode', () => {
    // Test different non-query modes
    const nonQueryModes = ['default', 'location', 'measure']

    nonQueryModes.forEach(mode => {
      jest.mocked(useApp).mockReturnValue({
        options: { id: 'test' },
        dispatch: mockDispatch,
        mode,
        activePanel: null,
        isMobile: false
      })

      const { container } = render(<HelpButton helpBtnRef={mockHelpBtnRef} />)
      expect(container.firstChild).toBeNull()
    })
  })

  it.each([
    // Test all combinations of isMobile and activePanel
    [false, null, { 'aria-expanded': false }],
    [true, null, { 'aria-expanded': false, 'aria-labelledby': 'test-help-label' }],
    [false, 'HELP', { 'aria-expanded': false, style: { display: 'none' } }],
    [true, 'HELP', {
      'aria-expanded': false,
      'aria-labelledby': 'test-help-label',
      style: { display: 'none' }
    }],
    [false, 'OTHER', { 'aria-expanded': false }],
    [true, 'OTHER', { 'aria-expanded': false, 'aria-labelledby': 'test-help-label' }]
  ])('should render correct button attributes when isMobile=%s and activePanel=%s',
    (isMobile, activePanel, expectedAttributes) => {
      jest.mocked(useApp).mockReturnValue({
        ...defaultProps,
        isMobile,
        activePanel
      })

      const { container } = render(<HelpButton helpBtnRef={mockHelpBtnRef} />)

      const button = container.querySelector('button')
      expect(button).toBeTruthy()

      // Check base classes
      expect(button.classList.contains('fm-c-btn')).toBe(true)
      expect(button.classList.contains('fm-c-btn--help')).toBe(true)
      expect(button.classList.contains('govuk-body-s')).toBe(true)

      // Check aria-expanded
      expect(button.getAttribute('aria-expanded')).toBe('false')

      // Check aria-labelledby when mobile
      if (isMobile) {
        expect(button.getAttribute('aria-labelledby')).toBe('test-help-label')
      } else {
        expect(button.hasAttribute('aria-labelledby')).toBe(false)
      }

      // Check style when activePanel is HELP
      if (activePanel === 'HELP') {
        expect(button.style.display).toBe('none')
      } else {
        expect(button.style.display).toBe('')
      }
    })

  // Test click handler
  it('should call dispatch with correct action when clicked', () => {
    jest.mocked(useApp).mockReturnValue({
      ...defaultProps,
      isMobile: false,
      activePanel: null
    })

    const { container } = render(<HelpButton helpBtnRef={mockHelpBtnRef} />)

    const button = container.querySelector('button')
    fireEvent.click(button)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'OPEN',
      payload: 'HELP'
    })
  })
})
