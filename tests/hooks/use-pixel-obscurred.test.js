import { renderHook } from '@testing-library/react'
import { usePixelObscurred } from '../../src/js/hooks/use-pixel-obscurred'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import { getScale } from '../../src/js/lib/viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/lib/viewport')

describe('usePixelObscurred', () => {
  let mockProvider
  let mockViewportRef
  let mockTargetMarker
  let mockSize

  beforeEach(() => {
    mockProvider = {
      isLoaded: true,
      getPixel: jest.fn(() => [100, 200])
    }
    mockViewportRef = {
      current: {
        getBoundingClientRect: jest.fn(() => ({ top: 10, left: 20 }))
      }
    }
    mockTargetMarker = { coord: [51.5074, -0.1278] }
    mockSize = { width: 800, height: 600 }

    useApp.mockReturnValue({
      provider: mockProvider,
      info: {},
      viewportRef: mockViewportRef,
      targetMarker: mockTargetMarker,
      isMobile: false,
      padding: 10
    })

    useViewport.mockReturnValue({ size: mockSize })
    getScale.mockReturnValue(1)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return false when no targetMarker is provided', () => {
    useApp.mockReturnValueOnce({
      ...useApp(),
      targetMarker: null
    })

    const { result } = renderHook(() => usePixelObscurred())
    expect(result.current[0]).toBe(false)
  })

  it('should return true if the pixel is obscured by an element with the class ".fm-c-panel--info"', () => {
    document.elementFromPoint = jest.fn(() => ({
      closest: jest.fn(() => ({ className: 'fm-c-panel--info' }))
    }))

    const { result } = renderHook(() => usePixelObscurred())
    expect(result.current[0]).toBe(true)
  })

  it('should return false if the pixel is not obscured', () => {
    document.elementFromPoint = jest.fn(() => ({
      closest: jest.fn(() => null)
    }))

    const { result } = renderHook(() => usePixelObscurred())
    expect(result.current[0]).toBe(false)
  })

  it('should reset to false on cleanup', () => {
    const { result, unmount } = renderHook(() => usePixelObscurred())
    expect(result.current[0]).toBe(false)

    unmount()
    expect(result.current[0]).toBe(false)
  })

  it('should calculate pixel position using provider and scale', () => {
    renderHook(() => usePixelObscurred())
    expect(mockProvider.getPixel).toHaveBeenCalledWith(mockTargetMarker.coord)
    expect(getScale).toHaveBeenCalledWith(mockSize)
  })
})
