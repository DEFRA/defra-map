import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import Draw from '../../src/js/components/draw'
import { useApp } from '../../src/js/store/use-app'
import { useDrawHandlers } from '../../src/js/hooks/use-draw-handlers'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/hooks/use-draw-handlers')

describe('draw', () => {
  const appDispatch = jest.fn()
  const options = { id: 'test' }
  const handleAddClick = jest.fn()
  const handleEditClick = jest.fn()
  const handleDeleteClick = jest.fn()

  jest.mocked(useDrawHandlers).mockReturnValue({ handleAddClick, handleEditClick, handleDeleteClick })

  it('should not render if queryArea is not specified', () => {
    jest.mocked(useApp).mockReturnValue({ options })
    const { container } = render(<Draw />)
    expect(container.innerHTML).toEqual('')
  })

  it('should be expandable if queryArea has a collapse value ', async () => {
    jest.mocked(useApp).mockReturnValue({
      options,
      queryArea: { heading: 'Expandable area', collapse: 'collapse' },
      drawTools: [{ id: 'square', name: 'Square' }],
      dispatch: appDispatch,
      isDrawMenuExpanded: false
    })
    render(<Draw />)
    await fireEvent.click(screen.getByText('Expandable area'))
    expect(appDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_DRAW_EXPANDED', payload: true })
  })

  it('should handle a click to add a shape', () => {
    jest.mocked(useApp).mockReturnValue({
      options,
      drawTools: [{ id: 'square', name: 'Square' }],
      queryArea: { heading: 'TEST' }
    })

    render(<Draw />)
    fireEvent.click(screen.getByText('Add square'))
    expect(handleAddClick).toHaveBeenCalled()
  })

  it('should handle a click to edit a shape', () => {
    jest.mocked(useApp).mockReturnValue({
      options,
      drawTools: [{ id: 'square', name: 'Square' }],
      isDrawMenuExpanded: false,
      query: true,
      queryArea: { heading: 'TEST', collapse: 'collapse' }
    })

    const { container } = render(<Draw />)
    console.log(container.innerHTML)
    fireEvent.click(screen.getByText('Edit shape'))
    expect(handleEditClick).toHaveBeenCalled()
  })

  it('should handle a click to delete a shape', () => {
    jest.mocked(useApp).mockReturnValue({
      options,
      drawTools: [{ id: 'square', name: 'Square' }],
      isDrawMenuExpanded: true,
      query: true,
      queryArea: { heading: 'TEST', collapse: 'expanded' }
    })

    render(<Draw />)
    fireEvent.click(screen.getByText('Delete shape'))
    expect(handleDeleteClick).toHaveBeenCalled()
  })
})
