import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Reset from '../../src/js/components/reset'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

jest.mocked(useApp).mockReturnValue({
  options: {
    id: 'test',
    hasReset: true
  }
})

describe('reset', () => {
  it('should call dispatch', () => {
    const dispatch = jest.fn()

    jest.mocked(useViewport).mockReturnValue({
      bbox: '1',
      rZoom: '1',
      zoom: '1',
      centre: { value: '101' },
      oCentre: { value: '100' },
      options: { hasRest: true },
      dispatch
    })

    const { container } = render(<Reset />)

    fireEvent.click(container.querySelector('button'))

    expect(dispatch).toHaveBeenCalled()
  })

  it('should not call dispatch', () => {
    const dispatch = jest.fn()

    jest.mocked(useViewport).mockReturnValue({
      bbox: '1',
      rZoom: '1',
      zoom: '1',
      centre: { value: '100' },
      oCentre: { value: '100' },
      options: { hasRest: true },
      dispatch
    })

    const { container } = render(<Reset />)

    fireEvent.click(container.querySelector('button'))

    expect(dispatch).toHaveBeenCalledTimes(0)
  })
})
