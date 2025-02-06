import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import Actions from '../../src/js/components/actions'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('actions', () => {
  const drawFinish = jest.fn()
  const dispatch = jest.fn()
  const viewportDispatch = jest.fn()
  const viewPortRefFocus = jest.fn()

  jest.mocked(useViewport).mockReturnValue({
    dispatch: viewportDispatch,
    size: null,
    basemap: null
  })

  jest.mocked(eventBus)

  it('should handle click for Confirm label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
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

    render(<Actions cancelBtnRef={null} />)

    fireEvent.click(screen.getByText('Confirm area'))

    expect(drawFinish).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for Cancel label', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
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

    render(<Actions />)

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

    render(<Actions />)

    fireEvent.click(screen.getByText('Update area'))

    expect(screen.getByText('Update area')).toBeTruthy()
    expect(drawFinish).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })

  it('should handle click for Polygon Query', () => {
    jest.mocked(useApp).mockReturnValue({
      dispatch,
      query: true,
      queryArea: { submitLabel: 'Submit' },
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

    render(<Actions />)

    const button = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(button)

    expect(screen.getByText('Submit')).toBeTruthy()
    expect(drawFinish).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })
})
