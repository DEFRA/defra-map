import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import Draw from '../../src/js/components/draw'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import { isFeatureSquare } from '../../src/js/lib/viewport'
import { events } from '../../src/js/store/constants'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/lib/viewport')

describe('draw', () => {
  const draw = jest.fn()
  const appDispatch = jest.fn()
  const viewportDispatch = jest.fn()
  const activeRef = {}
  const viewportRef = {}

  jest.mocked(isFeatureSquare).mockResolvedValue(true)

  jest.mocked(useViewport).mockReturnValue({
    dispatch: viewportDispatch,
    size: null,
    style: 'dummyStyle'
  })

  jest.mocked(eventBus)

  it('should handle click for Start label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef,
      viewportRef,
      mode: 'frame',
      queryArea: { heading: '' },
      provider: { draw: { start: draw } }
    })

    render(<Draw />)
    fireEvent.click(screen.getByText('Add'))

    expect(screen.getByText('Add')).toBeTruthy()
    expect(draw).toHaveBeenCalled()
    expect(viewportDispatch).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for Edit label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef,
      viewportRef,
      mode: 'draw',
      query: true,
      queryArea: { heading: '' },
      provider: { draw: { start: draw } }
    })

    render(<Draw />)
    fireEvent.click(screen.getByText('Edit'))

    expect(screen.getByText('Edit')).toBeTruthy()
    expect(draw).toHaveBeenCalled()
    expect(viewportDispatch).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for an initial draw', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatch,
      activeRef,
      viewportRef,
      queryArea: { heading: '' },
      provider: { initDraw: draw },
      drawMode: 'frame'
    })

    render(<Draw />)
    fireEvent.click(screen.getByText('Add'))

    expect(draw).toHaveBeenCalled()
  })

  it('should handle click for Delete label', () => {
    const deleteFn = jest.fn()
    const appDispatchDelete = jest.fn()
    const viewportDispatchDelete = jest.fn()
    const focusMock = jest.fn()
    const activeRefDelete = { current: null }
    const viewportRefDelete = { current: { focus: focusMock } }

    jest.mocked(useApp).mockReturnValue({
      dispatch: appDispatchDelete,
      activeRef: activeRefDelete,
      viewportRef: viewportRefDelete,
      query: true,
      parent: 'parentElement',
      queryArea: { heading: 'Test Heading' },
      provider: { draw: { delete: deleteFn } }
    })

    jest.mocked(useViewport).mockReturnValue({
      dispatch: viewportDispatchDelete,
      size: 'dummySize',
      style: 'dummyStyle'
    })

    render(<Draw />)
    fireEvent.click(screen.getByText('Delete'))

    expect(deleteFn).toHaveBeenCalled()
    expect(appDispatchDelete).toHaveBeenCalledWith({ type: 'SET_MODE', payload: { query: null } })
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      'parentElement',
      events.APP_ACTION,
      { type: 'deletePolygon', query: true }
    )
    expect(activeRefDelete.current).toBe(viewportRefDelete.current)
    expect(focusMock).toHaveBeenCalled()
  })
})
