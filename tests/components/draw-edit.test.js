import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import DrawEdit from '../../src/js/components/draw-edit'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('draw-edit', () => {
  const drawEdit = jest.fn()
  const drawReset = jest.fn()
  const dispatch = jest.fn()

  it('should handle edit click and not show use square button', () => {
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
    const useButton = screen.getByText('Use square')

    fireEvent.click(editButton)

    expect(drawEdit).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(useButton.style.display).toEqual('none')
  })

  it('should handle use square click and not show edit button', () => {
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
    const useButton = screen.getByText('Use square')

    fireEvent.click(useButton)

    expect(drawReset).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(editButton.style.display).toEqual('none')
  })
})
