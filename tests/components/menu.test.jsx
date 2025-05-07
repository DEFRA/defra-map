import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import Menu from '../../src/js/components/menu'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import { getFeatureShape } from '../../src/js/lib/viewport'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/lib/viewport')

describe('menu', () => {
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
      mode: 'frame',
      drawModes: ['circle', 'square', 'polygon'],
      shape: 'square',
      queryArea: {
        heading: ''
      },
      provider: {
        draw: {
          edit: mockEdit
        }
      }
    })

    render(<Menu />)

    fireEvent.click(screen.getByText('Add shape'))

    expect(screen.getByText('Add shape')).toBeTruthy()
    expect(mockEdit).toHaveBeenCalled()
    expect(appDispatch).toHaveBeenCalledWith({ type: 'SET_MODE', payload: { value: 'frame', query: undefined } })
    expect(viewportDispatch).toHaveBeenCalledWith({ type: 'SWAP_STYLES', payload: { styles: undefined, minZoom: undefined, maxZoom: undefined } })
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for Edit label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef,
      viewportRef,
      mode: 'vertex',
      drawModes: ['circle', 'square', 'polygon'],
      shape: 'polygon',
      query: true,
      queryArea: {
        heading: ''
      },
      provider: {
        draw: {
          edit: mockEdit
        }
      }
    })

    render(<Menu />)

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
      queryArea: {
        heading: ''
      },
      provider: {
        draw: {
          delete: mockDelete
        }
      },
      drawMode: 'frame',
      drawModes: ['circle', 'square', 'polygon'],
      shape: 'square'
    })

    render(<Menu />)

    expect(screen.getByText('Delete shape')).toBeTruthy()
    fireEvent.click(screen.getByText('Delete shape'))
    expect(mockDelete).toHaveBeenCalled()
  })
})
