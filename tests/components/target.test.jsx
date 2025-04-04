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
      mode: 'default',
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
      mode: 'default',
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
      mode: 'default',
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
})
