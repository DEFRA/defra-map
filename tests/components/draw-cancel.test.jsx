import React from 'react'
import { fireEvent, render } from '@testing-library/react'

import DrawCancel from '../../src/js/components/draw-cancel'
import eventBus from '../../src/js/lib/eventbus'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/lib/eventbus')
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('draw-cancel', () => {
  const drawCancel = jest.fn()
  const dispatch = jest.fn()
  const viewPortRefFocus = jest.fn()

  jest.mocked(useApp).mockReturnValue({
    dispatch,
    provider: {
      draw: {
        cancel: drawCancel
      }
    },
    viewportRef: {
      current: {
        focus: viewPortRefFocus
      }
    }
  })

  jest.mocked(useViewport).mockReturnValue({
    size: null,
    basemap: null
  })

  jest.mocked(eventBus)

  it('should handle click', () => {
    render(<DrawCancel cancelBtnRef={null} />)

    fireEvent.click(document.querySelector('button'))

    expect(drawCancel).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(viewPortRefFocus).toHaveBeenCalled()
    expect(eventBus.dispatch).toHaveBeenCalled()
  })
})
