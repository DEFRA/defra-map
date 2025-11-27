import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MapButton } from './MapButton'
import { getIconRegistry } from '../../registry/iconRegistry.js'
import { stringToKebab } from '../../../utils/stringToKebab'
import { useApp } from '../../store/appContext'

// mocks
jest.mock('../../../utils/stringToKebab', () => ({
  stringToKebab: jest.fn((str) => str ? str.replace(/\s+/g, '-').toLowerCase() : '')
}))

jest.mock('../Tooltip/Tooltip', () => ({
  Tooltip: ({ content, children }) => (
    <div data-testid="tooltip" data-content={content}>{children}</div>
  )
}))

jest.mock('../../registry/iconRegistry.js', () => ({
  getIconRegistry: jest.fn()
}))

jest.mock('../../renderer/SlotRenderer', () => ({
  SlotRenderer: ({ slot }) => <div data-testid="slot" data-slot={slot} />
}))

jest.mock('../../store/configContext', () => ({
  useConfig: jest.fn(() => ({ id: 'app' }))
}))

jest.mock('../../store/appContext', () => ({
  useApp: jest.fn(() => ({ buttonRefs: { current: {} } }))
}))

const renderMapButton = (props = {}) =>
  render(<MapButton buttonId="Test" iconId="icon" label="Label" {...props} />)

describe('MapButton', () => {
  let mockButtonRefs

  beforeEach(() => {
    jest.clearAllMocks()
    mockButtonRefs = { current: {} }
    useApp.mockReturnValue({ buttonRefs: mockButtonRefs })
    getIconRegistry.mockReturnValue({})
    stringToKebab.mockImplementation((str) => str ? str.replace(/\s+/g, '-').toLowerCase() : '')
  })

  it('renders with label, classNames, and optional icon', () => {
    const MockIcon = (props) => <svg data-testid="icon" {...props} />
    getIconRegistry.mockReturnValue({ icon: MockIcon })

    renderMapButton({ buttonId: 'My Button', variant: 'primary', showLabel: true })

    const button = screen.getByRole('button', { name: 'Label' })
    expect(button).toHaveClass('dm-c-map-button', 'dm-c-map-button--my-button', 'dm-c-map-button--primary', 'dm-c-map-button--with-label')
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('wraps in Tooltip when showLabel is false', () => {
    renderMapButton({ showLabel: false })
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-content', 'Label')
  })

  describe('aria attributes', () => {
    it('applies aria attributes and renders SlotRenderer when panelId is provided', () => {
      renderMapButton({ panelId: 'Settings', idPrefix: 'prefix', isDisabled: true, isExpanded: true, isOpen: false })

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(button).toHaveAttribute('aria-controls', 'prefix-panel-settings')
      expect(screen.getByTestId('slot')).toHaveAttribute('data-slot', 'test-button')
    })

    it('sets aria-pressed true when isOpen is true', () => {
      renderMapButton({ panelId: 'Menu', idPrefix: 'prefix', isOpen: true })
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('omits aria-expanded when isExpanded is undefined', () => {
      renderMapButton({ isExpanded: undefined })
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-expanded')
    })
  })

  it('fires onClick handler', () => {
    const handleClick = jest.fn()
    renderMapButton({ onClick: handleClick })
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('hides the button wrapper when isHidden is true', () => {
    const { container } = renderMapButton({ isHidden: true })
    expect(container.firstChild).toHaveStyle('display: none')
  })

  describe('button ref storage', () => {
    it('stores button ref in buttonRefs.current', () => {
      renderMapButton({ buttonId: 'TestButton' })
      expect(mockButtonRefs.current['TestButton']).toBe(screen.getByRole('button'))
    })

    it('does not store ref when buttonId is missing', () => {
      renderMapButton({ buttonId: null })
      expect(Object.keys(mockButtonRefs.current)).toHaveLength(0)
    })
  })

  describe('wrapper group classes', () => {
    it.each([
      ['groupStart', 'dm-c-button-wrapper--group-start'],
      ['groupMiddle', 'dm-c-button-wrapper--group-middle'],
      ['groupEnd', 'dm-c-button-wrapper--group-end']
    ])('applies %s class', (prop, className) => {
      const { container } = renderMapButton({ [prop]: true })
      expect(container.firstChild).toHaveClass(className)
    })
  })

  describe('anchor element with href', () => {
    it('renders as anchor with target="_blank" and role="button"', () => {
      renderMapButton({ href: 'https://example.com' })
      const link = screen.getByRole('button')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it.each([
      [' ', 'Space'],
      ['Spacebar', 'Spacebar']
    ])('triggers click when %s key is pressed', (key) => {
      renderMapButton({ href: 'https://example.com' })
      const link = screen.getByRole('button')
      const clickSpy = jest.spyOn(link, 'click')
      
      fireEvent.keyUp(link, { key })
      
      expect(clickSpy).toHaveBeenCalled()
      clickSpy.mockRestore()
    })

    it('prevents default behavior when Space is pressed', () => {
      renderMapButton({ href: 'https://example.com' })
      const link = screen.getByRole('button')
      const event = new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      
      link.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('does not trigger click for non-space keys', () => {
      renderMapButton({ href: 'https://example.com' })
      const link = screen.getByRole('button')
      const clickSpy = jest.spyOn(link, 'click')
      
      fireEvent.keyUp(link, { key: 'Enter' })
      
      expect(clickSpy).not.toHaveBeenCalled()
      clickSpy.mockRestore()
    })
  })

  it('renders as button element without href', () => {
    renderMapButton()
    const button = screen.getByRole('button')
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
  })
})