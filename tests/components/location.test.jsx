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

beforeEach(() => {
  jest.clearAllMocks()
  window.sessionStorage.clear()

  useApp.mockReturnValue({
    provider: mockProvider,
    options: { id: 'test-id', hasGeoLocation: true },
    mode: 'default',
    dispatch: mockDispatch
  })

  useViewport.mockReturnValue({ dispatch: mockDispatch })
})

test('renders null when hasGeoLocation is false', () => {
  useApp.mockReturnValue({
    provider: mockProvider,
    options: { id: 'test-id', hasGeoLocation: false },
    mode: 'default'
  })

  const { container } = render(<Location />)
  expect(container.firstChild).toBeNull()
})

test('renders location button when hasGeoLocation is true', () => {
  render(<Location />)
  expect(screen.getByRole('button', { name: /use your location/i })).not.toBeNull()
})

test('calls handleOnClick when button is clicked', () => {
  render(<Location />)
  fireEvent.click(screen.getByRole('button'))
  expect(mockProvider.getGeoLocation).toHaveBeenCalled()
  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'UPDATE_STATUS',
    payload: { status: 'Getting location', isStatusVisuallyHidden: false }
  })
})

test('uses sessionStorage when location exists', () => {
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

test('dispatches error action on geolocation error', () => {
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
