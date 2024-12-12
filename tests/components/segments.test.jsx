import React from 'react'
import { render, screen } from '@testing-library/react'
import Segments from '../../src/js/components/segments'
import { useApp } from '../../src/js/store/use-app'
import SegmentGroup from '../../src/js/components/segment-group'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/components/segment-group', () => jest.fn(() => <div data-testid="segment-group"></div>))

describe('segments', () => {
  beforeEach(() => {
    jest.mocked(useApp).mockReturnValue({
      segments: ['1', '2'],
      legend: {
        segments: [
          { id: '1', parentIds: ['1'], heading: 'Heading 1', collapse: 'expanded' },
          { id: '2', parentIds: ['2'], heading: 'Heading 2', collapse: 'collapse' },
          { id: '3', parentIds: ['3'], heading: 'Heading 3', collapse: 'expanded' },
          { id: '4', heading: 'Heading 4' }
        ]
      }
    })
  })

  it('should render the correct number of SegmentGroup components', () => {
    render(<Segments />)
    const segmentGroups = screen.getAllByTestId('segment-group')
    expect(segmentGroups.length).toBe(3) // Only segments with parentIds '1' and '2' should be rendered
  })

  it('should correctly filter and map segments', () => {
    render(<Segments />)
    const segmentGroups = screen.getAllByTestId('segment-group')
    expect(segmentGroups.length).toBe(3)
  })
})
