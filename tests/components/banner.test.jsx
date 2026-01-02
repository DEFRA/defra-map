import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useApp } from '../../src/js/store/use-app'
import Banner from '../../src/js/components/banner'
jest.mock('../../src/js/store/use-app')

describe('Banner', () => {
  const message = 'TEST BANNER'
  const current = {
    focus: jest.fn()
  }

  it('should render a message', async () => {
    jest.mocked(useApp).mockReturnValue({ banner: { message } })
    render(<Banner />)
    expect(screen.getByText(message)).toBeInTheDocument()
  })
  const tests = [
    ['banner is not set', undefined, undefined, undefined],
    ['activePanel === "SEARCH" && isMobile', {}, 'SEARCH', true]
  ]
  tests.forEach(([description, banner, activePanel, isMobile]) => {
    it(`should render with display: none when ${description}`, async () => {
      jest.mocked(useApp).mockReturnValue({ banner, activePanel, isMobile })
      const { container } = render(<Banner />)
      const element = container.querySelector('.fm-c-banner__inner')
      expect(element.style.display).toBe('none')
    })
  })

  it('should dispatch SET_BANNER if isDismissable set and button is clicked', async () => {
    const dispatch = jest.fn()
    jest.mocked(useApp).mockReturnValue({ dispatch, viewportRef: { current }, banner: { message, isDismissable: true } })
    render(<Banner />)
    expect(screen.getByText(message)).toBeInTheDocument()
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_BANNER', payload: null })
    expect(current.focus).toHaveBeenCalled()
  })
})
