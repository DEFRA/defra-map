import React from 'react'
import { render, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import PaddingBox from '../../src/js/components/padding-box'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

describe('PaddingBox', () => {
  const mockProvider = {
    map: {},
    setPadding: jest.fn()
  }

  const mockViewportDispatch = jest.fn()
  const mockViewportRef = { current: document.createElement('div') }
  const mockObscurePanelRef = { current: document.createElement('div') }
  const mockFrameRef = { current: document.createElement('div') }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useViewport hook
    jest.mocked(useViewport).mockReturnValue({
      dispatch: mockViewportDispatch,
      features: {
        featuresInViewport: [],
        isPixelFeaturesInMap: false
      },
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
      isAnimate: true
    })
  })

  it('should render children correctly', () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      options: {},
      isContainerReady: true,
      mode: 'default',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      frameRef: mockFrameRef,
      interfaceType: 'mouse',
      isMobile: false
    })

    const { container } = render(
      <PaddingBox>
        <div data-testid='child'>Test Content</div>
      </PaddingBox>
    )

    expect(container.firstChild).toHaveClass('fm-c-padding-box')
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument()
  })

  it('should update provider padding when padding changes', async () => {
    const mockTargetMarker = { coord: [0, 0] }

    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      options: {},
      isContainerReady: true,
      mode: 'default',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      frameRef: mockFrameRef,
      interfaceType: 'mouse',
      isMobile: false,
      targetMarker: mockTargetMarker
    })

    await act(async () => {
      render(<PaddingBox />)
    })

    expect(mockProvider.setPadding).toHaveBeenCalledWith(mockTargetMarker.coord, true)
  })

  it('should set initial viewport padding when container is ready', async () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      options: {},
      isContainerReady: true,
      mode: 'default',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      frameRef: mockFrameRef,
      interfaceType: 'mouse',
      isMobile: false
    })

    await act(async () => {
      render(<PaddingBox />)
    })

    expect(mockViewportDispatch).toHaveBeenCalledWith({
      type: 'SET_PADDING',
      payload: {
        panel: mockObscurePanelRef.current,
        viewport: mockViewportRef.current,
        isMobile: false
      }
    })
  })

  it('should update padding when isMobile changes', async () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      options: {},
      isContainerReady: true,
      mode: 'default',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      frameRef: mockFrameRef,
      interfaceType: 'mouse',
      isMobile: true
    })

    jest.useFakeTimers()

    await act(async () => {
      render(<PaddingBox />)
    })

    await act(async () => {
      jest.runAllTimers()
    })

    expect(mockViewportDispatch).toHaveBeenCalledWith({
      type: 'SET_PADDING',
      payload: {
        panel: mockObscurePanelRef.current,
        viewport: mockViewportRef.current,
        isMobile: true,
        isAnimate: false
      }
    })

    jest.useRealTimers()
  })

  it('should reset padding when entering frame or draw mode', async () => {
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      options: {},
      isContainerReady: true,
      mode: 'frame',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      frameRef: mockFrameRef,
      interfaceType: 'mouse',
      isMobile: false
    })

    await act(async () => {
      render(<PaddingBox />)
    })

    expect(mockViewportDispatch).toHaveBeenCalledWith({
      type: 'SET_PADDING',
      payload: {
        viewport: mockViewportRef.current,
        isMobile: false,
        isAnimate: false
      }
    })
  })

  it('should apply correct className based on props', () => {
    // Mock useViewport with the necessary features state
    jest.mocked(useViewport).mockReturnValue({
      dispatch: mockViewportDispatch,
      features: {
        featuresInViewport: ['feature1'], // Make sure this matches your component's check
        isPixelFeaturesInMap: true
      },
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
      isAnimate: true
    })

    // Mock useApp with all necessary conditions for active state
    jest.mocked(useApp).mockReturnValue({
      provider: mockProvider,
      options: {
        queryLocation: { layers: ['layer1'] },
        queryFeature: { layers: ['layer2'] }
      },
      isContainerReady: true,
      mode: 'frame',
      viewportRef: mockViewportRef,
      obscurePanelRef: mockObscurePanelRef,
      frameRef: mockFrameRef,
      interfaceType: 'keyboard',
      isMobile: false,
      features: {
        featuresInViewport: ['feature1'],
        isPixelFeaturesInMap: true
      },
      isActive: true // Add this if your component checks for it
    })

    const { container } = render(<PaddingBox />)

    expect(container.firstChild).toHaveClass('fm-c-padding-box')
    expect(container.firstChild).toHaveClass('fm-c-padding-box--frame-mode')
    expect(container.firstChild).toHaveClass('fm-c-padding-box--visible')
    expect(container.firstChild).toHaveClass('fm-c-padding-box--active')

    // You can also test the complete className string
    expect(container.firstChild).toHaveClass(
      'fm-c-padding-box fm-c-padding-box--frame-mode fm-c-padding-box--visible fm-c-padding-box--active'
    )
  })
})
