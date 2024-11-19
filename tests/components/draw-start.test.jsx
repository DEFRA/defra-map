import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import DrawStart from '../../src/js/components/draw-start'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('draw-start', () => {
  const draw = jest.fn()
  const dispatch = jest.fn()

  jest.mocked(useViewport).mockReturnValue({
    size: null,
    basemap: null
  })

  jest.mocked(eventBus)

  it('should handle click for Start label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      mode: 'frame',
      queryPolygon: {
        startLabel: 'test add'
      },
      provider: {
        draw: {
          start: draw
        }
      }
    })

    const { container } = render(<DrawStart />)

    fireEvent.click(document.querySelector('button'))

    expect(screen.getByText('test add')).toBeTruthy()
    expect(container.querySelector('button').hasAttribute('aria-disabled')).toEqual(true)
    expect(draw).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for Edit label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      mode: 'draw',
      query: true,
      queryPolygon: {
        editLabel: 'test edit'
      },
      provider: {
        draw: {
          start: draw
        }
      }
    })

    const { container } = render(<DrawStart />)

    fireEvent.click(document.querySelector('button'))

    expect(screen.getByText('test edit')).toBeTruthy()
    expect(container.querySelector('button').hasAttribute('aria-disabled')).toEqual(false)
    expect(draw).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for an initial draw', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      mode: 'draw',
      query: true,
      queryPolygon: {
        editLabel: 'test edit'
      },
      provider: {
        initDraw: draw
      }
    })

    render(<DrawStart />)

    fireEvent.click(document.querySelector('button'))

    expect(draw).toHaveBeenCalled()
  })
})
