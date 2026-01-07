import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useApp } from '../../src/js/store/use-app'
import EditButton from '../../src/js/components/edit-button'
jest.mock('../../src/js/store/use-app')

describe('EditButton', () => {
  it('should render null if mode is not frame or vertex', async () => {
    jest.mocked(useApp).mockReturnValue({ options: { } })
    const { container } = render(<EditButton />)
    expect(container).toBeEmptyDOMElement()
  })

  const tests = [
    ['activePanel is INSPECTOR and mode is vertex', 'INSPECTOR', false, 'vertex'],
    ['activePanel is INSPECTOR and mode is frame', 'INSPECTOR', false, 'frame']
  ]
  tests.forEach(([description, activePanel, isDesktop, mode]) => {
    it(`should render with display: none when ${description}`, async () => {
      jest.mocked(useApp).mockReturnValue({ activePanel, isDesktop, mode, options: { id: 'test' } })
      const { container } = render(<EditButton />)
      const element = container.querySelector('.fm-c-btn')
      expect(element.style.display).toBe('none')
    })
  })

  it('should dispatch OPEN if button is clicked', async () => {
    const dispatch = jest.fn()
    jest.mocked(useApp).mockReturnValue({ dispatch, activePanel: 'STYLE', isDesktop: false, mode: 'vertex', options: { id: 'test' } })
    render(<EditButton />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN', payload: 'INSPECTOR' })
  })
})
