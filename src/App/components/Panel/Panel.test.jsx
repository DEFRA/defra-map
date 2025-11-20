// components/Panel.test.jsx
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Panel } from './Panel'
import { useConfig } from '../../store/configContext'
import { useApp } from '../../store/appContext'
import { useModalPanelBehaviour } from '../../hooks/useModalPanelBehaviour.js'

jest.mock('../../store/configContext', () => ({ useConfig: jest.fn() }))
jest.mock('../../store/appContext', () => ({ useApp: jest.fn() }))
jest.mock('../../../utils/stringToKebab', () => ({ stringToKebab: (str) => str.toLowerCase().replace(/\s+/g, '-') }))
jest.mock('../../registry/iconRegistry.js', () => ({
  getIconRegistry: jest.fn(() => ({ close: (props) => <svg data-testid="close-icon" {...props} /> }))
}))
jest.mock('../../hooks/useModalPanelBehaviour.js', () => ({ useModalPanelBehaviour: jest.fn() }))

describe('Panel', () => {
  let dispatch, layoutRefs
  const baseConfig = { desktop: { slot: 'side', initiallyOpen: true, dismissable: false, modal: false }, showLabel: true, label: 'Test Panel' }

  beforeEach(() => {
    dispatch = jest.fn()
    layoutRefs = { mainRef: { current: {} }, viewportRef: { current: { focus: jest.fn() } } }
    useConfig.mockReturnValue({ id: 'app' })
    useApp.mockReturnValue({ dispatch, breakpoint: 'desktop', layoutRefs })
    document.body.innerHTML = `<div id="app-dm-app"></div>`

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb())
  })

  afterEach(() => {
    window.requestAnimationFrame.mockRestore()
  })

  const renderPanel = (overrides = {}) => render(<Panel panelId="Settings" panelConfig={baseConfig} {...overrides} />)

  it('renders as aside region with label visible', () => {
    renderPanel()
    const panel = screen.getByRole('region')
    expect(panel).toHaveAttribute('id', 'app-panel-settings')
    expect(panel).toHaveClass('dm-c-panel')
    expect(screen.getByText('Test Panel')).toHaveClass('dm-c-panel__heading', 'dm-e-heading-m')
  })

  it('renders with visually hidden label when showLabel=false', () => {
    renderPanel({ panelConfig: { ...baseConfig, showLabel: false } })
    expect(screen.getByText('Test Panel')).toHaveClass('dm-u-visually-hidden')
  })

  it('renders dialog and complementary roles', () => {
    renderPanel({ panelConfig: { ...baseConfig, desktop: { slot: 'overlay', initiallyOpen: false, dismissable: true, modal: false } } })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    renderPanel({ panelConfig: { ...baseConfig, desktop: { slot: 'side', initiallyOpen: true, dismissable: true, modal: false } } })
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('sets aria-modal and tabIndex when dialog and modal', () => {
    renderPanel({ panelConfig: { ...baseConfig, desktop: { slot: 'overlay', initiallyOpen: false, dismissable: true, modal: true } } })
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('tabIndex', '-1')
    expect(dialog).toHaveClass('dm-c-panel dm-c-panel--overlay')
  })

  it('applies width style', () => {
    renderPanel({ panelConfig: { ...baseConfig, desktop: { slot: 'side', initiallyOpen: true, dismissable: false, modal: false, width: '300px' } } })
    expect(screen.getByRole('region')).toHaveStyle({ width: '300px' })
  })

  it('calls returnFocus for top-button slot', () => {
    const focusMock = jest.fn()
    const triggeringElement = { focus: focusMock, parentNode: {} }
    renderPanel({ props: { triggeringElement }, panelConfig: { ...baseConfig, desktop: { slot: 'top-button', initiallyOpen: true, dismissable: true, modal: false } } })

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Close Test Panel' }))
    })

    expect(focusMock).toHaveBeenCalled()
    expect(screen.getByTestId('close-icon')).toBeInTheDocument()
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_PANEL', payload: 'Settings' })
  })

  it('falls back to viewportRef.current.focus when no triggeringElement provided', () => {
    renderPanel({ panelConfig: { ...baseConfig, desktop: { slot: 'side', initiallyOpen: true, dismissable: true, modal: false } } })

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Close Test Panel' }))
    })

    expect(layoutRefs.viewportRef.current.focus).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_PANEL', payload: 'Settings' })
  })

  it('renders children or WrappedChild', () => {
    renderPanel({ children: <p>Child content</p> })
    expect(screen.getByText('Child content')).toBeInTheDocument()

    const Wrapped = (props) => <p>Wrapped {props.extra}</p>
    renderPanel({ WrappedChild: Wrapped, props: { extra: 'content' } })
    expect(screen.getByText('Wrapped content')).toBeInTheDocument()
  })
})