import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import DrawEdit from '../../src/js/components/draw-edit'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('draw-edit', () => {
  const drawEdit = jest.fn()
  const drawReset = jest.fn()
  const dispatch = jest.fn()

  it('should handle polygon click and show current selection: square', () => {
    jest.mocked(useApp).mockReturnValue({
      mode: 'frame',
      shape: 'square',
      dispatch,
      provider: {
        draw: {
          edit: drawEdit,
          reset: drawReset
        }
      },
      options: {
        id: 'test'
      }
    })

    render(<DrawEdit />)

    expect(screen.getByText('Current selection: Square')).toBeTruthy()
    const polygonOption = screen.getByText('Polygon')

    fireEvent.click(polygonOption)

    expect(drawEdit).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
  })

  it('should handle square click and show current selection: polygon', () => {
    jest.mocked(useApp).mockReturnValue({
      mode: 'vertex',
      shape: 'polygon',
      dispatch,
      provider: {
        draw: {
          edit: drawEdit,
          reset: drawReset
        }
      },
      options: {
        id: 'test'
      }
    })

    render(<DrawEdit />)

    expect(screen.getByText('Current selection: Polygon')).toBeTruthy()
    const squareOption = screen.getByText('Square')

    fireEvent.click(squareOption)

    expect(drawReset).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
  })
})
