import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import DrawFinish from '../../src/js/components/draw-finish'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('draw-finish', () => {
  const drawFinish = jest.fn()
  const dispatch = jest.fn()
  const viewPortRefFocus = jest.fn()

  jest.mocked(useViewport).mockReturnValue({
    size: null,
    basemap: null
  })

  jest.mocked(eventBus)

  it('should handle click for Confirm label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      queryPolygon: {
        buttonLabel: 'test'
      },
      provider: {
        draw: {
          finish: drawFinish
        }
      },
      viewportRef: {
        current: {
          focus: viewPortRefFocus
        }
      }
    })

    render(<DrawFinish cancelBtnRef={null} />)

    fireEvent.click(screen.getByText('Confirm test'))

    expect(drawFinish).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for Cancel label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      queryPolygon: {
        buttonLabel: 'test'
      },
      provider: {
        draw: {
          cancel: drawFinish
        }
      },
      viewportRef: {
        current: {
          focus: viewPortRefFocus
        }
      }
    })

    render(<DrawFinish />)

    fireEvent.click(screen.getByText('Cancel'))

    expect(drawFinish).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for Update label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      query: true,
      queryPolygon: {
        buttonLabel: 'test'
      },
      provider: {
        draw: {
          finish: drawFinish
        }
      },
      viewportRef: {
        current: {
          focus: viewPortRefFocus
        }
      }
    })

    render(<DrawFinish />)

    fireEvent.click(screen.getByText('Update test'))

    expect(screen.getByText('Update test')).toBeTruthy()
    expect(drawFinish).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })
})
