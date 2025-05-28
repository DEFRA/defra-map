import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import DrawMenu from '../../src/js/components/draw-menu'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import { getFeatureShape } from '../../src/js/lib/viewport'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/lib/viewport')

describe('menu', () => {
  const mockAdd = jest.fn()
  const mockEdit = jest.fn()
  const mockDelete = jest.fn()
  const appDispatch = jest.fn()
  const viewportDispatch = jest.fn()
  const activeRef = {}
  const viewportRef = {}

  jest.mocked(getFeatureShape).mockResolvedValue(true)

  jest.mocked(useViewport).mockReturnValue({
    dispatch: viewportDispatch,
    size: null,
    basemap: null
  })

  jest.mocked(eventBus)

  it('should handle click for Start label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef,
      viewportRef,
      drawMode: 'frame',
      shape: 'square',
      drawTools: [
        {
          id: 'square',
          name: 'Square'
        }
      ],
      options: {
        id: 'testId'
      },
      draw: {},
      provider: {
        map: {},
        draw: {
          add: mockAdd
        }
      }
    })

    render(<DrawMenu />)
    expect(screen.getByText('Add square')).toBeTruthy()

    fireEvent.click(screen.getByText('Add square'))

    expect(mockAdd).toHaveBeenCalled()
    expect(appDispatch).toHaveBeenCalledWith({ type: 'SET_MODE', payload: { value: 'frame', shape: 'square', query: undefined } })
    expect(viewportDispatch).toHaveBeenCalledWith({ type: 'SWAP_STYLES', payload: { styles: undefined, minZoom: undefined, maxZoom: undefined } })
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for Edit label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef,
      viewportRef,
      drawMode: 'vertex',
      shape: 'polygon',
      query: true,
      options: {
        id: 'testId'
      },
      drawTools: [
        {
          id: 'square',
          name: 'Square'
        }
      ],
      draw: {},
      provider: {
        map: {},
        draw: {
          edit: mockEdit
        }
      }
    })

    render(<DrawMenu />)

    fireEvent.click(screen.getByText('Edit shape'))

    expect(screen.getByText('Edit shape')).toBeTruthy()
    expect(mockEdit).toHaveBeenCalled()
    expect(viewportDispatch).toHaveBeenCalledWith({ type: 'SWAP_STYLES', payload: { styles: undefined, minZoom: undefined, maxZoom: undefined } })
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click on Delete label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef,
      viewportRef,
      query: {},
      drawTools: [
        {
          id: 'square',
          name: 'Square'
        }
      ],
      options: {
        id: 'testId'
      },
      draw: {},
      provider: {
        map: {},
        draw: {
          delete: mockDelete
        }
      },
      drawTool: 'frame',
      shape: 'square'
    })

    render(<DrawMenu />)

    expect(screen.getByText('Delete shape')).toBeTruthy()
    fireEvent.click(screen.getByText('Delete shape'))
    expect(mockDelete).toHaveBeenCalled()
  })
})
