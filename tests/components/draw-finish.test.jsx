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

  it('should handle click for Add label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      queryPolygon: {
        addLabel: 'test add'
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

    fireEvent.click(document.querySelector('button'))

    expect(screen.getByText('test add')).toBeTruthy()
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
        updateLabel: 'test update'
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

    fireEvent.click(document.querySelector('button'))

    expect(screen.getByText('test update')).toBeTruthy()
    expect(drawFinish).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })
})
