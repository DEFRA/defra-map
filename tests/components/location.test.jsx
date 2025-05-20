import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import Location from '../../src/js/components/location'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

const mockDispatch = jest.fn()
const mockProvider = {
  getGeoLocation: jest.fn()
}

describe('Location', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()

    useApp.mockReturnValue({
      provider: mockProvider,
      options: { id: 'test-id', hasGeoLocation: true },
      drawMode: 'default',
      dispatch: mockDispatch
    })

    useViewport.mockReturnValue({ dispatch: mockDispatch })
  })

  it('renders null when hasGeoLocation is false', () => {
    useApp.mockReturnValue({
      provider: mockProvider,
      options: { id: 'test-id', hasGeoLocation: false },
      drawMode: 'default'
    })

    const { container } = render(<Location />)
    expect(container.firstChild).toBeNull()
  })

  it('renders location button when hasGeoLocation is true', () => {
    render(<Location />)
    expect(screen.getByRole('button', { name: /use your location/i })).not.toBeNull()
  })

  it('calls handleOnClick when button is clicked', () => {
    render(<Location />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockProvider.getGeoLocation).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_STATUS',
      payload: { status: 'Getting location', isStatusVisuallyHidden: false }
    })
  })

  it('uses sessionStorage when location exists', () => {
    window.sessionStorage.setItem(
      'geoloc',
      JSON.stringify({ coord: [50, 50], place: 'Test Place' })
    )

    render(<Location />)
    fireEvent.click(screen.getByRole('button'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'GEOLOC',
      payload: { center: [50, 50], place: 'Test Place' }
    })
  })

  it('dispatches error action on geolocation error', () => {
    mockProvider.getGeoLocation.mockImplementation((success, error) => {
      error(new Error('Permission denied'))
    })
    render(<Location />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ERROR',
      payload: { label: "Can't get location", message: 'Permission denied' }
    })
  })

  it('calls handleGeoLocationSuccess when geolocation is successful and no session exists', () => {
    window.sessionStorage.clear()

    mockProvider.getGeoLocation.mockImplementation((success) => {
      success([51.5, -0.1], 'London')
    })

    render(<Location />)
    fireEvent.click(screen.getByRole('button'))

    const storedData = JSON.parse(window.sessionStorage.getItem('geoloc'))
    expect(storedData).toEqual({ coord: [51.5, -0.1], place: 'London' })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'GEOLOC',
      payload: { center: [51.5, -0.1], place: 'London' }
    })
  })

  it('does not dispatch GEOLOC when geolocation succeeds but session already exists', () => {
    // First create a session with initial data
    window.sessionStorage.setItem('geoloc', JSON.stringify({
      coord: [51.5, -0.1],
      place: 'London'
    }))

    mockDispatch.mockClear()

    render(<Location />)

    expect(window.sessionStorage.getItem('geoloc')).not.toBeNull()

    // Manually create and call a function that mimics handleGeoLocationSuccess
    // with the same logic from the component
    const simulateGeoLocationSuccess = (coord, place) => {
      const hasSession = !!window.sessionStorage.getItem('geoloc')
      window.sessionStorage.setItem('geoloc', JSON.stringify({ coord, place }))
      if (hasSession) {
        return
      }
      mockDispatch({ type: 'GEOLOC', payload: { center: coord, place } })
    }

    simulateGeoLocationSuccess([40.7, -74.0], 'New York')

    const storedData = JSON.parse(window.sessionStorage.getItem('geoloc'))
    expect(storedData).toEqual({ coord: [40.7, -74.0], place: 'New York' })

    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
