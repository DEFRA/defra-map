import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import Draw from '../../src/js/components/draw'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import { isFeatureSquare } from '../../src/js/lib/viewport'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/lib/viewport')

describe('draw', () => {
  const draw = jest.fn()
  const dispatch = jest.fn()

  jest.mocked(isFeatureSquare).mockResolvedValue(true)

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
        heading: ''
      },
      provider: {
        draw: {
          start: draw
        }
      }
    })

    render(<Draw />)

    fireEvent.click(screen.getByText('Add area'))

    expect(screen.getByText('Add area')).toBeTruthy()
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
        heading: ''
      },
      provider: {
        draw: {
          start: draw
        }
      }
    })

    render(<Draw />)

    fireEvent.click(screen.getByText('Edit area'))

    expect(screen.getByText('Edit area')).toBeTruthy()
    expect(draw).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for an initial draw', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      queryPolygon: {
        heading: ''
      },
      provider: {
        initDraw: draw
      },
      drawMode: 'frame'
    })

    render(<Draw />)

    fireEvent.click(screen.getByText('Add area'))

    expect(draw).toHaveBeenCalled()
  })
})
