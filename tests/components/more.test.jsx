import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import More from '../../src/js/components/more'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('more', () => {
  jest.mocked(useApp).mockReturnValue({
    activeRef: null
  })

  it('should show button', () => {
    render(
      <More
        id='test'
        label='Test more'
        isExpanded={false}
        isRemove={false}
        setIsExpanded={jest.fn()}
      />
    )

    expect(screen.getByText('Test more')).toBeTruthy()
  })

  it('should not display button', () => {
    const { container } = render(
      <More
        id='test'
        label='Test more'
        isExpanded
        isRemove
        setIsExpanded={jest.fn()}
      />
    )

    expect(container.querySelector('button')).toBeFalsy()
  })

  it('should handle click', () => {
    const setIsExpanded = jest.fn()

    render(
      <More
        id='test'
        label='Test more'
        isExpanded={false}
        isRemove={false}
        setIsExpanded={setIsExpanded}
      />
    )

    fireEvent.click(screen.getByText('Test more'))

    expect(setIsExpanded).toHaveBeenCalled()
  })
})
