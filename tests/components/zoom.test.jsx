import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Zoom from '../../src/js/components/zoom'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('zoom', () => {
  beforeEach(() => {
    jest.mocked(useApp).mockReturnValue({
      options: {
        id: 'test-id',
        maxZoom: 10,
        minZoom: 1
      },
      dispatch: jest.fn()
    })

    jest.mocked(useViewport).mockReturnValue({
      zoom: 5,
      action: jest.fn(),
      dispatch: jest.fn()
    })
  })

  it('should show zoom in button', () => {
    render(<Zoom />)
    const zoomInButton = screen.getByRole('button', { name: /zoom in/i })
    expect(zoomInButton).toBeTruthy()
  })

  it('should show zoom out button', () => {
    render(<Zoom />)
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i })
    expect(zoomOutButton).toBeTruthy()
  })

  it('should dispatch ZOOM_IN action on zoom in button click', () => {
    const viewportDispatchMock = jest.fn()
    jest.mocked(useViewport).mockReturnValue({
      zoom: 5,
      action: jest.fn(),
      dispatch: viewportDispatchMock
    })

    render(<Zoom />)

    const zoomInButton = screen.getByRole('button', { name: /zoom in/i })
    fireEvent.click(zoomInButton)

    expect(viewportDispatchMock).toHaveBeenCalledWith({ type: 'ZOOM_IN' })
  })

  it('should dispatch ZOOM_OUT action on zoom out button click', () => {
    const viewportDispatchMock = jest.fn()
    jest.mocked(useViewport).mockReturnValue({
      zoom: 5,
      action: jest.fn(),
      dispatch: viewportDispatchMock
    })

    render(<Zoom />)

    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i })
    fireEvent.click(zoomOutButton)

    expect(viewportDispatchMock).toHaveBeenCalledWith({ type: 'ZOOM_OUT' })
  })
})
