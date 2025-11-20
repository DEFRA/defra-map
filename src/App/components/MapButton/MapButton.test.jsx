import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MapButton } from './MapButton'
import { getIconRegistry } from '../../registry/iconRegistry.js'
import { stringToKebab } from '../../../utils/stringToKebab'

// mocks
jest.mock('../../../utils/stringToKebab', () => ({
  stringToKebab: jest.fn((str) => str.replace(/\s+/g, '-').toLowerCase())
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

// helper
const renderMapButton = (props = {}) =>
  render(<MapButton buttonId="Test" iconId="icon" label="Label" {...props} />)

describe('MapButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getIconRegistry.mockReturnValue({})
    stringToKebab.mockImplementation((str) => str.replace(/\s+/g, '-').toLowerCase())
  })

  it('renders with label, classNames, and optional icon', () => {
    const MockIcon = (props) => <svg data-testid="icon" {...props} />
    getIconRegistry.mockReturnValue({ icon: MockIcon })

    renderMapButton({ buttonId: 'My Button', variant: 'primary', showLabel: true })

    const button = screen.getByRole('button', { name: 'Label' })
    expect(button).toHaveClass(
      'dm-c-map-button',
      'dm-c-map-button--my-button',
      'dm-c-map-button--primary'
    )
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('wraps in Tooltip when showLabel is false', () => {
    renderMapButton({ showLabel: false })
    expect(screen.getByTestId('tooltip')).toHaveAttribute('data-content', 'Label')
  })

  it('applies aria attributes and renders SlotRenderer when panelId is provided', () => {
    renderMapButton({
      panelId: 'Settings',
      idPrefix: 'prefix',
      isDisabled: true,
      isExpanded: true,
      isOpen: false
    })

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

  it('fires onClick handler', () => {
    const handleClick = jest.fn()
    renderMapButton({ onClick: handleClick })
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('omits aria-expanded when isExpanded is undefined', () => {
    renderMapButton({ isExpanded: undefined })
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-expanded')
  })

  it('hides the button wrapper when isHidden is true', () => {
    const { container } = renderMapButton({ isHidden: true })
    const wrapper = container.firstChild // the outermost <div> wrapper
    expect(wrapper).toHaveStyle('display: none')
  })

  it('renders SlotRenderer when panelId is provided', () => {
    renderMapButton({ panelId: 'Panel', idPrefix: 'prefix' })
    expect(screen.getByTestId('slot')).toBeInTheDocument()
  })
})
