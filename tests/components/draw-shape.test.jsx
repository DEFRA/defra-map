import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { drawModes } from '../../src/js/store/constants'
import DrawShape from '../../src/js/components/draw-shape'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('draw-edit', () => {
  it('should handle shape click and show current selection', () => {
    const mockDispatch = jest.fn()
    const mockDrawShape = jest.fn()
    const mockUseApp = jest.mocked(useApp)

    // Function to update mock return value dynamically
    const updateMockUseApp = (shape, mode) => {
      mockUseApp.mockReturnValue({
        mode,
        shape,
        drawModes,
        dispatch: mockDispatch,
        provider: { draw: { edit: mockDrawShape } },
        options: { id: 'test' }
      })
    }

    // Initialize with default shape
    updateMockUseApp('circle', 'frame')

    const shapes = [
      { shape: 'circle', label: 'Circle', mode: 'frame' },
      { shape: 'square', label: 'Square', mode: 'frame' },
      { shape: 'polygon', label: 'Polygon', mode: 'vertex' }
    ]

    shapes.forEach(({ shape, label, mode }) => {
      // Update mocks before clicking
      updateMockUseApp(shape, mode)
      render(<DrawShape />)

      // Open the menu
      fireEvent.click(screen.getByText(`Current selection: ${label}`))
      const menu = screen.getByRole('menu')
      expect(screen.getByRole('menu')).toBeTruthy()

      // Click on the shape option
      const shapeOption = within(menu).getByText(label)
      fireEvent.click(shapeOption)

      // Verify drawEdit was called with updated values
      expect(mockDrawShape).toHaveBeenCalledWith(mode, shape)

      // Verify dispatch was called with updated mode and shape
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_MODE',
        payload: { value: mode, shape }
      })

      // Verify that the correct selection is displayed
      expect(screen.getByText(`Current selection: ${label}`)).toBeTruthy()
    })
  })
})
