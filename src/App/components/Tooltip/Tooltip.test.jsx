import React, { forwardRef } from 'react'
import { render, fireEvent, act, cleanup } from '@testing-library/react'
import { Tooltip } from './Tooltip'
import { useApp } from '../../store/appContext'
import { getTooltipPosition } from './getTooltipPosition'

jest.mock('../../store/appContext')
jest.mock('./getTooltipPosition')
jest.useFakeTimers()

describe('Tooltip', () => {
  const Button = forwardRef((props, ref) => <button ref={ref} {...props}>Test button</button>)

  const renderTooltip = (props = {}, interfaceType = 'mouse') => {
    useApp.mockReturnValue({ interfaceType })
    getTooltipPosition.mockReturnValue('bottom')

    const { container, unmount } = render(
      <Tooltip content="Test tooltip" {...props}>
        <Button />
      </Tooltip>
    )

    const wrapper = container.firstChild
    const button = wrapper.querySelector('button')
    const tooltip = wrapper.querySelector('[role="tooltip"]')

    return { wrapper, button, tooltip, unmount }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(cleanup)

  it('renders with correct initial state', () => {
    const { tooltip } = renderTooltip()
    expect(tooltip).toHaveClass('dm-c-tooltip--hidden')
    expect(tooltip).not.toHaveClass('dm-c-tooltip--is-visible')
    expect(tooltip).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows and hides tooltip on mouse interactions', () => {
    const { button, tooltip } = renderTooltip()

    act(() => {
      fireEvent.mouseEnter(button)
      jest.advanceTimersByTime(500)
    })
    expect(tooltip).toHaveClass('dm-c-tooltip--is-visible')
    expect(getTooltipPosition).toHaveBeenCalled()

    act(() => {
      fireEvent.mouseLeave(button)
      jest.advanceTimersByTime(0)
    })
    expect(tooltip).not.toHaveClass('dm-c-tooltip--is-visible')
  })

  it('cancels tooltip on mouse down or key down', () => {
    const { button, tooltip } = renderTooltip()

    act(() => {
      fireEvent.mouseEnter(button)
      fireEvent.mouseDown(button)
      fireEvent.mouseEnter(button)
      fireEvent.keyDown(button)
      jest.advanceTimersByTime(500)
    })

    expect(tooltip).not.toHaveClass('dm-c-tooltip--is-visible')
  })

  it('handles focus interactions for keyboard interface', () => {
    const { button, tooltip, wrapper } = renderTooltip({}, 'keyboard')

    act(() => {
      fireEvent.focus(button)
      jest.advanceTimersByTime(500)
    })
    expect(wrapper).toHaveClass('dm-c-tooltip-wrapper--has-focus')
    expect(tooltip).toHaveClass('dm-c-tooltip--is-visible')

    act(() => {
      fireEvent.blur(button)
      jest.advanceTimersByTime(0)
    })
    expect(wrapper).not.toHaveClass('dm-c-tooltip-wrapper--has-focus')
    expect(tooltip).not.toHaveClass('dm-c-tooltip--is-visible')
  })

  it('does not show tooltip on focus if interfaceType is mouse', () => {
    const { button, tooltip } = renderTooltip()

    act(() => {
      fireEvent.focus(button)
      jest.advanceTimersByTime(500)
    })
    expect(tooltip).not.toHaveClass('dm-c-tooltip--is-visible')
  })

  it('hides tooltip on Escape key', () => {
    const { button, tooltip } = renderTooltip()

    act(() => {
      fireEvent.mouseEnter(button)
      jest.advanceTimersByTime(500)
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(tooltip).not.toHaveClass('dm-c-tooltip--is-visible')
  })

  it('removes keydown listener on unmount', () => {
    const { button, unmount, wrapper } = renderTooltip({}, 'keyboard')

    act(() => {
      fireEvent.mouseEnter(button)
      jest.advanceTimersByTime(500)
    })

    const removeSpy = jest.spyOn(window, 'removeEventListener')
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })
})
