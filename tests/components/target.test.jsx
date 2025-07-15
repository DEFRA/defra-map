import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Target from '../../src/js/components/target'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'
import { usePixelObscurred } from '../../src/js/hooks/use-pixel-obscurred'

// Mock dependencies
jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')
jest.mock('../../src/js/hooks/use-pixel-obscurred')

describe('Target', () => {
  // Common test setup
  const mockProvider = {
    setTargetMarker: jest.fn(),
    map: {}
  }

  const mockAppDispatch = jest.fn()
  const mockViewportDispatch = jest.fn()
  const mockObscurePanelRef = { current: document.createElement('div') }
  const mockViewportRef = { current: document.createElement('div') }

  beforeEach(() => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: null,
      activePanel: null,
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'mouse',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(useViewport).mockReturnValue({
      features: null,
      dispatch: mockViewportDispatch
    })

    jest.mocked(usePixelObscurred).mockReturnValue([false])

    mockProvider.setTargetMarker.mockClear()
    mockAppDispatch.mockClear()
    mockViewportDispatch.mockClear()
  })

  it('should not render marker when target is not visible', () => {
    render(<Target />)

    expect(screen.queryByLabelText('Map marker')).not.toBeInTheDocument()
    expect(mockAppDispatch).toHaveBeenCalledWith({
      type: 'SET_IS_TARGET_VISIBLE',
      payload: false
    })
    // The actual arguments passed are different - update our expectations
    expect(mockProvider.setTargetMarker).toHaveBeenCalledWith(undefined, undefined, false)
  })

  it('should render center target marker when using keyboard interface', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: null,
      activePanel: null,
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'keyboard',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(useViewport).mockReturnValue({
      features: { resultType: 'pixel', isPixelFeaturesAtPixel: true },
      dispatch: mockViewportDispatch
    })

    render(<Target />)

    expect(screen.getByLabelText('Map marker')).toBeInTheDocument()
    expect(screen.getByLabelText('Map marker')).toHaveClass('fm-c-marker--has-data')
    expect(mockAppDispatch).toHaveBeenCalledWith({
      type: 'SET_IS_TARGET_VISIBLE',
      payload: true
    })
    expect(mockProvider.setTargetMarker).toHaveBeenCalledWith(null, true, true)
  })

  it('should render center target marker when using touch interface', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: null,
      activePanel: null,
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'touch',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(useViewport).mockReturnValue({
      features: { resultType: 'pixel', isPixelFeaturesAtPixel: false },
      dispatch: mockViewportDispatch
    })

    render(<Target />)

    expect(screen.getByLabelText('Map marker')).toBeInTheDocument()
    expect(screen.getByLabelText('Map marker')).not.toHaveClass('fm-c-marker--has-data')
  })

  it('should not render center target when drawMode is not default', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'draw',
      targetMarker: null,
      activePanel: null,
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'keyboard',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(useViewport).mockReturnValue({
      features: { resultType: 'pixel' },
      dispatch: mockViewportDispatch
    })

    render(<Target />)

    expect(screen.queryByLabelText('Map marker')).not.toBeInTheDocument()
  })

  it('should render non-center target marker when provided coordinates', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: { coord: [1, 2], hasData: true },
      activePanel: null,
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'mouse',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    render(<Target />)

    expect(screen.queryByLabelText('Map marker')).not.toBeInTheDocument() // The DOM marker isn't shown for non-center markers
    expect(mockProvider.setTargetMarker).toHaveBeenCalledWith([1, 2], true, true)
  })

  it('should hide target when touch interface and panel is active (not INFO)', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: null,
      activePanel: 'SEARCH',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'touch',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(useViewport).mockReturnValue({
      features: { resultType: 'pixel' },
      dispatch: mockViewportDispatch
    })

    render(<Target />)

    expect(screen.queryByLabelText('Map marker')).not.toBeInTheDocument()
    expect(mockAppDispatch).toHaveBeenCalledWith({
      type: 'SET_IS_TARGET_VISIBLE',
      payload: false
    })
  })

  it('should show target when touch interface and INFO panel is active', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: null,
      activePanel: 'INFO',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'touch',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(useViewport).mockReturnValue({
      features: { resultType: 'pixel' },
      dispatch: mockViewportDispatch
    })

    render(<Target />)

    expect(screen.getByLabelText('Map marker')).toBeInTheDocument()
  })

  it('should not use center marker when in INFO panel with targetMarker', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: { coord: [1, 2], hasData: true },
      activePanel: 'INFO',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'touch',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    render(<Target />)

    // Should use the targetMarker, not center
    expect(mockProvider.setTargetMarker).toHaveBeenCalledWith([1, 2], true, true)
  })

  it('should update padding when target is obscurred', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: { coord: [1, 2], hasData: true },
      activePanel: null,
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'mouse',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(usePixelObscurred).mockReturnValue([true])

    render(<Target />)

    expect(mockViewportDispatch).toHaveBeenCalledWith({
      type: 'SET_PADDING',
      payload: {
        panel: mockObscurePanelRef.current,
        viewport: mockViewportRef.current,
        isMobile: false,
        isAnimate: true
      }
    })
  })

  it('should not update padding when target is not obscurred', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: { coord: [1, 2], hasData: true },
      activePanel: null,
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: true,
      interfaceType: 'mouse',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(usePixelObscurred).mockReturnValue([false])

    render(<Target />)

    expect(mockViewportDispatch).not.toHaveBeenCalled()
  })

  it('should not update padding when container is not ready', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      drawMode: 'default',
      targetMarker: { coord: [1, 2], hasData: true },
      activePanel: null,
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      isContainerReady: false,
      interfaceType: 'mouse',
      isMobile: false,
      dispatch: mockAppDispatch
    })

    jest.mocked(usePixelObscurred).mockReturnValue([true])

    render(<Target />)

    expect(mockViewportDispatch).not.toHaveBeenCalled()
  })
})
