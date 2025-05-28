import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { drawTools } from '../../src/js/store/constants'
import DrawAction from '../../src/js/components/draw-action'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('draw-action', () => {
  const mockDispatch = jest.fn()
  const mockDrawAction = jest.fn()
  const mockUseApp = jest.mocked(useApp)

  // Function to update mock return value dynamically
  const updateMockUseApp = (shape, drawMode) => {
    mockUseApp.mockReturnValue({
      drawMode,
      shape,
      drawTools,
      dispatch: mockDispatch,
      provider: { draw: { edit: mockDrawAction } },
      options: { id: 'test' }
    })
  }

  it('should open menu on click', () => {
    updateMockUseApp('square', 'frame')

    render(<DrawAction />)

    // Open the menu
    fireEvent.click(document.getElementById('test-draw-tools-button-label'))
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  // it('should handle shape click', () => {
  //   // Initialize with default shape
  //   updateMockUseApp('circle', 'frame')

  //   const shapes = [
  //     { shape: 'circle', label: 'Circle', drawMode: 'frame' },
  //     { shape: 'square', label: 'Square', drawMode: 'frame' },
  //     { shape: 'polygon', label: 'Polygon', drawMode: 'vertex' }
  //   ]

  //   shapes.forEach(({ shape, label, drawMode }) => {
  //     // Update mocks before clicking
  //     updateMockUseApp(shape, drawMode)
  //     render(<DrawAction />)

  //     // Open the menu
  //     fireEvent.click(screen.getByText())
  //     const menu = screen.getByRole('menu')
  //     expect(screen.getByRole('menu')).toBeTruthy()

  //     // Click on the shape option
  //     const shapeOption = within(menu).getByText(label)
  //     fireEvent.click(shapeOption)

  //     // Verify drawEdit was called with updated values
  //     expect(mockDrawAction).toHaveBeenCalledWith(drawMode, shape)

  //     // Verify dispatch was called with updated drawMode and shape
  //     expect(mockDispatch).toHaveBeenCalledWith({
  //       type: 'SET_MODE',
  //       payload: { value: drawMode, shape }
  //     })

  //     // Verify that the correct selection is displayed
  //     expect(screen.getByText(`Current selection: ${label}`)).toBeTruthy()
  //   })
  // })
})
