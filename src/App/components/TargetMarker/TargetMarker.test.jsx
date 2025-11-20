import React from 'react'
import { render } from '@testing-library/react'
import { TargetMarker } from './TargetMarker.jsx'
import { useTargetMarker } from '../../hooks/useTargetMarkerAPI.js'

jest.mock('../../hooks/useTargetMarkerAPI', () => ({ useTargetMarker: jest.fn() }))
jest.mock('../../store/configContext', () => ({ useConfig: jest.fn(() => ({ id: 'testApp' })) }))

describe('TargetMarker', () => {
  const markerRef = React.createRef()

  const renderWith = (overrides = {}) => {
    useTargetMarker.mockReturnValue({
      markerRef,
      targetMarker: {
        isVisible: true,
        isPinnedToMap: true,
        state: 'active',
        ...overrides
      }
    })
    return render(<TargetMarker />).container.querySelector('svg')
  }

  it('renders visible active marker when pinned', () => {
    const svg = renderWith()
    const path = svg.querySelector('path')

    expect(svg).toHaveClass('dm-c-target-marker')
    expect(svg).toHaveStyle({
      position: 'absolute',
      left: 0,
      top: 0,
      pointerEvents: 'none',
      display: 'block'
    })
    expect(path.getAttribute('d')).toContain('M5.035 20H1v-2h4.035C5.525') // active path
  })

  it('positions marker at center when not pinned', () => {
    const svg = renderWith({ isPinnedToMap: false })

    expect(svg).toHaveStyle({
      left: '50%',
      top: '50%'
    })
  })

  it('hides marker when not visible', () => {
    const svg = renderWith({ isVisible: false })
    expect(svg).toHaveStyle({ display: 'none' })
  })

  it.each([
    ['inactive', 'M5.035 20H1v-2h4.035a13.98'],
    [undefined, 'M5.035 20H1v-2h4.035C5.525'] // fallback to active
  ])('renders correct path for state=%s', (state, expected) => {
    const svg = renderWith({ state })
    expect(svg.querySelector('path').getAttribute('d')).toContain(expected)
  })
})
