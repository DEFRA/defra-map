import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import DrawEdit from '../../src/js/components/draw-edit'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('draw-edit', () => {
  const drawEdit = jest.fn()
  const drawReset = jest.fn()
  const dispatch = jest.fn()

  it('should handle edit click and not show use box button', () => {
    jest.mocked(useApp).mockReturnValue({
      mode: 'frame',
      dispatch,
      provider: {
        draw: {
          edit: drawEdit,
          reset: drawReset
        }
      }
    })

    render(<DrawEdit />)

    const editButton = screen.getByText('Edit shape')
    const useBoxButton = screen.getByText('Use box')

    fireEvent.click(editButton)

    expect(drawEdit).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(useBoxButton.style.display).toEqual('none')
  })

  it('should handle use box click and not show edit button', () => {
    jest.mocked(useApp).mockReturnValue({
      mode: 'draw',
      dispatch,
      provider: {
        draw: {
          edit: drawEdit,
          reset: drawReset
        }
      }
    })

    render(<DrawEdit />)

    const editButton = screen.getByText('Edit shape')
    const useBoxButton = screen.getByText('Use box')

    fireEvent.click(useBoxButton)

    expect(drawEdit).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(editButton.style.display).toEqual('none')
  })
})
