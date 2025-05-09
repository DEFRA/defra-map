import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import KeyButton from '../../src/js/components/key-button'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('key-button', () => {
  const mockDispatch = jest.fn()
  const mockKeyBtnRef = { current: null }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useApp).mockReturnValue({
      activePanel: null,
      options: { legend: { key: {} } },
      mode: null,
      dispatch: jest.fn()
    })
  })

  it('should render key button', () => {
    render(<KeyButton />)
    const keyButton = screen.getByRole('button', { name: /key/i })
    expect(keyButton).toBeTruthy()
  })

  it('should dispatch OPEN action on click', () => {
    const dispatchMock = jest.fn()
    jest.mocked(useApp).mockReturnValue({
      activePanel: null,
      options: { legend: { key: {} } },
      mode: null,
      dispatch: dispatchMock
    })

    render(<KeyButton />)

    const keyButton = screen.getByRole('button', { name: /key/i })
    fireEvent.click(keyButton)

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'OPEN', payload: 'KEY' })
  })

  it('should hide button when activePanel is KEY', () => {
    jest.mocked(useApp).mockReturnValue({
      activePanel: 'KEY',
      options: { legend: { key: {} } },
      mode: null,
      dispatch: jest.fn()
    })

    const { container } = render(<KeyButton />)

    const keyButton = container.querySelector('.fm-c-btn--key')

    expect(keyButton).toHaveStyle('display: none;')
  })
  it.each([
    // [options, mode, shouldRender, description]
    [{ legend: undefined }, null, false, 'should not render when legend is undefined'],
    [{ legend: null }, null, false, 'should not render when legend is null'],
    [{ legend: false }, null, false, 'should not render when legend is false'],
    [{ legend: { display: true } }, null, false, 'should not render when legend display is true'],
    [{ legend: { key: {} } }, 'frame', false, 'should not render when mode is frame'],
    [{ legend: { key: {} } }, 'draw', false, 'should not render when mode is draw'],
    [{ legend: {} }, null, true, 'should render when legend is empty object'],
    [{ legend: { display: false } }, null, true, 'should render when legend display is false']
  ])('component rendering: %s', (options, mode, shouldRender, description) => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: mockDispatch,
      options,
      mode,
      activePanel: null
    })

    const { container } = render(<KeyButton keyBtnRef={mockKeyBtnRef} />)

    if (shouldRender) {
      expect(container.firstChild).not.toBeNull()
      expect(container.querySelector('.fm-c-btn--key')).toBeTruthy()
    } else {
      expect(container.firstChild).toBeNull()
    }
  })
})
