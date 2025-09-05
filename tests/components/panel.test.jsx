import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Panel from '../../src/js/components/panel'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/hooks/use-outside-interact', () => ({
  useOutsideInteract: jest.fn()
}))
jest.mock('../../src/js/lib/dom', () => ({
  constrainFocus: jest.fn(),
  toggleInert: jest.fn()
}))

describe('Panel', () => {
  const mockDispatch = jest.fn()
  const mockObscurePanelRef = { current: null }
  const mockActiveRef = { current: null }

  beforeEach(() => {
    useApp.mockReturnValue({
      options: { id: 'test' },
      isMobile: false,
      dispatch: mockDispatch,
      obscurePanelRef: mockObscurePanelRef,
      activeRef: mockActiveRef,
      activePanelHasFocus: false
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the panel with the correct class names', () => {
    render(<Panel className='test-class' />)
    expect(screen.getByRole('region')).toHaveClass('fm-c-panel--test-class')
  })

  it('should render the panel with the correct header class names', () => {
    const { container } = render(<Panel className='test-class' />)
    const div = container.querySelector('div div div')
    const h2 = div.querySelector('h2')
    expect(div.className).toEqual('fm-c-panel__header')
    expect(h2.className).toEqual('fm-c-panel__heading govuk-heading-s')
  })

  it('should render the panel with the correct header class names when isHideHeading is true', () => {
    const { container } = render(<Panel className='test-class' isHideHeading />)
    const div = container.querySelector('div div div')
    const h2 = div.querySelector('h2')
    expect(div.className).toEqual('fm-c-panel__header fm-c-panel__header--collapse')
    expect(h2.className).toEqual('fm-u-visually-hidden')
  })

  it('should render the panel with the correct role based on instigatorRef', () => {
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel instigatorRef={instigatorRef} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should render the panel with the correct aria attributes', () => {
    render(<Panel label='Test Label' />)
    expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'test-panel-label')
  })

  it('should render the panel with the correct width and maxWidth styles when not on mobile and hasWidth is true', () => {
    render(<Panel width='200px' maxWidth='300px' />)
    expect(screen.getByRole('region')).toHaveStyle({ width: '200px', maxWidth: '300px' })
  })

  it('should render the panel header with the correct label', () => {
    render(<Panel label='Test Label' />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render the close button when hasCloseBtn is true', () => {
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel instigatorRef={instigatorRef} />)
    expect(screen.getByLabelText('Close panel')).toBeInTheDocument()
  })

  it('should render the panel body with the correct HTML content', () => {
    render(<Panel html='<p>Test HTML</p>' />)
    expect(screen.getByText('Test HTML')).toBeInTheDocument()
  })

  it('should render the panel body with the correct children content', () => {
    render(<Panel><p>Test Children</p></Panel>)
    expect(screen.getByText('Test Children')).toBeInTheDocument()
  })

  it('should render the mask when isModal is true', () => {
    render(<Panel isModal />)
    expect(document.querySelector('.fm-c-panel-mask')).toBeInTheDocument()
  })

  it('should call handleClose when the close button is clicked', () => {
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel instigatorRef={instigatorRef} />)
    fireEvent.click(screen.getByLabelText('Close panel'))
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE' })
  })

  it('should call handleClose when clicking outside the panel if isModal is true', () => {
    const { useOutsideInteract } = require('../../src/js/hooks/use-outside-interact')
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel isModal instigatorRef={instigatorRef} />)
    useOutsideInteract.mock.calls[0][3]()
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE' })
  })

  it.each([['Escape'], ['Esc']])('should call handleClose when pressing the %s key', (key) => {
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel instigatorRef={instigatorRef} />)
    fireEvent.keyUp(screen.getByRole('dialog'), { key })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE' })
  })

  it('should not call handleClose when pressing the Enter key', () => {
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel instigatorRef={instigatorRef} />)
    fireEvent.keyUp(screen.getByRole('dialog'), { key: 'Enter' })
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'CLOSE' })
  })

  it('should toggle inert elements on focus', () => {
    const { toggleInert } = require('../../src/js/lib/dom')
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel instigatorRef={instigatorRef} />)
    expect(toggleInert).toHaveBeenCalledTimes(1)
    fireEvent.focus(screen.getByRole('dialog'))
    expect(toggleInert).toHaveBeenCalledTimes(2) // Expect a 2nd call
  })

  it('should not toggle inert elements on focusing on a different element', () => {
    const { toggleInert } = require('../../src/js/lib/dom')
    const instigatorRef = { current: document.createElement('div') }
    render(<> <div>Different Target</div><Panel instigatorRef={instigatorRef} /> </>)
    expect(toggleInert).toHaveBeenCalledTimes(1)
    fireEvent.focus(screen.getByText('Different Target'), { target: screen.getByRole('dialog') })
    expect(toggleInert).toHaveBeenCalledTimes(1)
  })

  it('should constrain focus on key down', () => {
    const { constrainFocus } = require('../../src/js/lib/dom')
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel instigatorRef={instigatorRef} />)
    fireEvent.keyDown(screen.getByRole('dialog'))
    expect(constrainFocus).toHaveBeenCalled()
  })

  it('should dispatch CONTAINER_READY on mount', () => {
    render(<Panel />)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CONTAINER_READY' })
  })

  it('should set obscurePanelRef correctly on mount', () => {
    render(<Panel isNotObscure />)
    expect(mockObscurePanelRef.current).not.toBeNull()
  })

  it('should toggle inert elements when isModal changes', () => {
    const { toggleInert } = require('../../src/js/lib/dom')
    const { rerender } = render(<Panel isModal={false} />)
    rerender(<Panel isModal />)
    expect(toggleInert).toHaveBeenCalledTimes(2)
  })

  it('should set activeRef correctly when activePanelHasFocus is true', () => {
    useApp.mockReturnValueOnce({
      options: { id: 'test' },
      isMobile: false,
      dispatch: mockDispatch,
      obscurePanelRef: mockObscurePanelRef,
      activeRef: mockActiveRef,
      activePanelHasFocus: true
    })
    render(<Panel instigatorRef={{ current: document.createElement('div') }} />)
    expect(mockActiveRef.current).not.toBeNull()
  })

  it('should set the correct tabIndex on the scrollable body', () => {
    const { rerender } = render(<Panel />)
    const body = screen.getByRole('region').querySelector('.fm-c-panel__body')
    Object.defineProperty(body, 'offsetHeight', { value: 100, writable: true })
    Object.defineProperty(body, 'scrollHeight', { value: 200, writable: true })
    rerender(<Panel />)
    expect(body.tabIndex).toBe(0)
  })

  it('should not render width styles if isMobile and isInset are true', () => {
    useApp.mockReturnValueOnce({ ...useApp(), isMobile: true })
    render(<Panel isInset width='200px' maxWidth='300px' />)
    expect(screen.getByRole('region')).not.toHaveStyle({ width: '200px', maxWidth: '300px' })
  })

  it('should reset obscurePanelRef on close', () => {
    const instigatorRef = { current: document.createElement('div') }
    render(<Panel instigatorRef={instigatorRef} isNotObscure />)
    fireEvent.click(screen.getByLabelText('Close panel'))
    expect(mockObscurePanelRef.current).toBeNull()
  })

  it('should not call toggleInert unnecessarily', () => {
    const { toggleInert } = require('../../src/js/lib/dom')
    render(<Panel isModal />)
    expect(toggleInert).toHaveBeenCalledTimes(1)
  })

  it('should not close the panel for non-Escape key presses', () => {
    render(<Panel />)
    fireEvent.keyUp(screen.getByRole('region'), { key: 'Enter' })
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'CLOSE' })
  })

  it('should not close the panel when clicking outside if isModal is false', () => {
    const { useOutsideInteract } = require('../../src/js/hooks/use-outside-interact')
    render(<Panel isModal={false} />)
    useOutsideInteract.mock.calls[0][3]()
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'CLOSE' })
  })
})
