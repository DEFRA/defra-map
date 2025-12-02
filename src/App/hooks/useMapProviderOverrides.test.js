import { renderHook } from '@testing-library/react'
import { useMapProviderOverrides } from './useMapProviderOverrides'
import { useConfig } from '../store/configContext.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { getSafeZoneInset } from '../../utils/getSafeZoneInset.js'
import { scalePoints } from '../../utils/scalePoints.js'
import { scaleFactor } from '../../config/appConfig.js'

jest.mock('../store/configContext.js')
jest.mock('../store/appContext.js')
jest.mock('../store/mapContext.js')
jest.mock('../../utils/getSafeZoneInset.js')
jest.mock('../../utils/scalePoints.js')

const setup = (overrides = {}) => {
  const dispatch = jest.fn()
  const layoutRefs = { mainRef: { current: document.createElement('div') } }
  const mapProvider = {
    fitToBounds: jest.fn(),
    setView: jest.fn(),
    setPadding: jest.fn(),
    ...overrides.mapProvider
  }

  useConfig.mockReturnValue({ mapProvider, ...overrides.config })
  useApp.mockReturnValue({ dispatch, layoutRefs, ...overrides.app })
  useMap.mockReturnValue({ mapSize: 'md', ...overrides.map })

  getSafeZoneInset.mockReturnValue({ top: 10, right: 5, bottom: 15, left: 5 })
  scalePoints.mockReturnValue({ top: 20, right: 10, bottom: 30, left: 10 })

  return { dispatch, layoutRefs, mapProvider }
}

describe('useMapProviderOverrides', () => {
  beforeEach(jest.clearAllMocks)

  test('early returns when mapProvider is null', () => {
    setup({ config: { mapProvider: null } })
    renderHook(() => useMapProviderOverrides())
    expect(getSafeZoneInset).not.toHaveBeenCalled()
  })

  test('fitToBounds and setView call updatePadding with correct flow', () => {
    const { mapProvider, dispatch, layoutRefs } = setup({ map: { mapSize: 'lg' } })
    renderHook(() => useMapProviderOverrides())

    const safeZone = { top: 10, right: 5, bottom: 15, left: 5 }
    const scaled = { top: 20, right: 10, bottom: 30, left: 10 }

    mapProvider.fitToBounds([0, 0, 1, 1], { animate: true })

    expect(getSafeZoneInset).toHaveBeenCalledWith(layoutRefs)
    expect(scalePoints).toHaveBeenCalledWith(safeZone, scaleFactor.lg)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SAFE_ZONE_INSET',
      payload: { safeZoneInset: safeZone, syncMapPadding: false }
    })
    expect(mapProvider.setPadding).toHaveBeenCalledWith(scaled)

    jest.clearAllMocks()
    mapProvider.setView({ center: [1, 2], zoom: 15 })

    expect(getSafeZoneInset).toHaveBeenCalledWith(layoutRefs)
    expect(dispatch).toHaveBeenCalled()
    expect(mapProvider.setPadding).toHaveBeenCalled()
  })

  test('fitToBounds and setView early return when bounds/center is null', () => {
    const { mapProvider, dispatch } = setup()
    const originalFitBounds = mapProvider.fitToBounds
    const originalSetView = mapProvider.setView
    renderHook(() => useMapProviderOverrides())

    mapProvider.fitToBounds(null)
    mapProvider.setView({ center: null, zoom: 10 })

    expect(dispatch).not.toHaveBeenCalled()
    expect(originalFitBounds).not.toHaveBeenCalled()
    expect(originalSetView).not.toHaveBeenCalled()
  })

  test('handles missing dispatch or setPadding gracefully', () => {
    const { mapProvider } = setup({
      app: { dispatch: null },
      mapProvider: { setPadding: null, fitToBounds: jest.fn(), setView: jest.fn() }
    })
    renderHook(() => useMapProviderOverrides())

    expect(() => {
      mapProvider.fitToBounds([0, 0, 1, 1])
      mapProvider.setView({ center: [0, 0], zoom: 10 })
    }).not.toThrow()
  })

  test('restores original fitToBounds on unmount and calls originals with context', () => {
    const { mapProvider } = setup()
    const originalFitBounds = mapProvider.fitToBounds
    const originalSetView = mapProvider.setView
    const { unmount } = renderHook(() => useMapProviderOverrides())

    expect(mapProvider.fitToBounds).not.toBe(originalFitBounds)

    mapProvider.fitToBounds([0, 0, 1, 1], { animate: false })
    mapProvider.setView({ center: [1, 2], zoom: 15 })

    expect(originalFitBounds).toHaveBeenCalledWith([0, 0, 1, 1], { animate: false })
    expect(originalSetView).toHaveBeenCalledWith({ center: [1, 2], zoom: 15 })

    unmount()
    expect(mapProvider.fitToBounds).toBe(originalFitBounds)
  })

  test('reapplies overrides when dependencies change', () => {
    const { mapProvider } = setup()
    const { rerender } = renderHook(() => useMapProviderOverrides())
    const firstOverride = mapProvider.fitToBounds

    setup({ map: { mapSize: 'lg' } })
    rerender()

    expect(mapProvider.fitToBounds).not.toBe(firstOverride)
  })
})
