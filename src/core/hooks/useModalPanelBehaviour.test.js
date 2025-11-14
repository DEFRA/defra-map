import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { useModalPanelBehaviour } from './useModalPanelBehaviour.js'
import * as useResizeObserverModule from './useResizeObserver.js'
import * as constrainFocusModule from '../../utils/constrainKeyboardFocus.js'
import * as toggleInertModule from '../../utils/toggleInertElements.js'

jest.mock('./useResizeObserver.js')
jest.mock('../../utils/constrainKeyboardFocus.js')
jest.mock('../../utils/toggleInertElements.js')

describe('useModalPanelBehaviour', () => {
  let mainRef, panelRef, buttonContainerEl, rootEl, handleClose

  beforeEach(() => {
    mainRef = { current: document.createElement('div') }
    panelRef = { current: document.createElement('div') }
    buttonContainerEl = document.createElement('div')
    rootEl = document.createElement('div')
    rootEl.appendChild(panelRef.current)
    document.body.appendChild(rootEl)
    handleClose = jest.fn()
    jest.clearAllMocks()

    // Reset CSS variable
    document.documentElement.style.setProperty('--modal-inset', '')
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  function TestComponent({ isModal = true }) {
    useModalPanelBehaviour({
      mainRef,
      panelRef,
      isModal,
      isAside: false,
      rootEl,
      buttonContainerEl,
      handleClose
    })
    return null
  }

  it('handles Escape and Tab keys', () => {
    render(<TestComponent />)
    const eventEscape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    panelRef.current.dispatchEvent(eventEscape)
    expect(handleClose).toHaveBeenCalled()

    const eventTab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    panelRef.current.dispatchEvent(eventTab)
    expect(constrainFocusModule.constrainKeyboardFocus).toHaveBeenCalledWith(panelRef.current, eventTab)
  })

  it('updates --modal-inset on resize', () => {
    useResizeObserverModule.useResizeObserver.mockImplementation((_, cb) => cb())
    Object.defineProperty(mainRef.current, 'getBoundingClientRect', {
      value: () => ({ top: 0, right: 100, bottom: 50, left: 0, width: 100, height: 50 }),
    })
    Object.defineProperty(buttonContainerEl, 'getBoundingClientRect', {
      value: () => ({ top: 10, right: 80, bottom: 40, left: 20, width: 60, height: 30 }),
    })
    render(<TestComponent />)
    const inset = getComputedStyle(document.documentElement).getPropertyValue('--modal-inset')
    expect(inset).toContain('10px')
  })

  it('clicking backdrop calls handleClose', () => {
    const backdrop = document.createElement('div')
    backdrop.className = 'am-o-app__modal-backdrop'
    rootEl.appendChild(backdrop)

    render(<TestComponent />)
    fireEvent.click(backdrop)
    expect(handleClose).toHaveBeenCalled()
  })

  it('toggles inert elements on mount and cleanup', () => {
    const { unmount } = render(<TestComponent />)
    expect(toggleInertModule.toggleInertElements).toHaveBeenCalledWith({
      containerEl: panelRef.current,
      isFullscreen: true,
      boundaryEl: rootEl
    })
    unmount()
    expect(toggleInertModule.toggleInertElements).toHaveBeenCalledWith({
      containerEl: panelRef.current,
      isFullscreen: false,
      boundaryEl: rootEl
    })
  })

  it('redirects focus into panel if focus leaves it', () => {
    const focusMock = jest.fn()
    panelRef.current.focus = focusMock

    render(<TestComponent />)

    // Focus an element inside rootEl but outside panelRef
    const outsideEl = document.createElement('input')
    rootEl.appendChild(outsideEl)
    outsideEl.focus()

    const event = new FocusEvent('focusin', { target: outsideEl, bubbles: true })
    document.dispatchEvent(event)

    expect(focusMock).toHaveBeenCalled()
  })

  it('does nothing if not modal', () => {
    render(<TestComponent isModal={false} />)
    fireEvent.keyDown(panelRef.current, { key: 'Escape' })
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('does nothing if focusedEl, panelRef, or rootEl is missing', () => {
    // Focus event with null target triggers the "if (!focusedEl)" branch
    render(<TestComponent />)
    const event = new FocusEvent('focusin', { target: null, bubbles: true })
    document.dispatchEvent(event)

    // Temporarily remove panelRef.current to hit "!panelEl" branch
    const originalPanel = panelRef.current
    panelRef.current = null
    const event2 = new FocusEvent('focusin', { target: document.body, bubbles: true })
    document.dispatchEvent(event2)
    panelRef.current = originalPanel

    // Temporarily remove rootEl to hit "!rootEl" branch
    const originalRoot = rootEl
    rootEl = null
    const event3 = new FocusEvent('focusin', { target: document.body, bubbles: true })
    document.dispatchEvent(event3)
    rootEl = originalRoot

    // The test passes if no errors are thrown
  })

})
