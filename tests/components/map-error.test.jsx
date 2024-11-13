import React from 'react'
import { render } from '@testing-library/react'

import MapError from '../../src/js/components/map-error'
import { useApp } from '../../src/js/store/use-app'

jest.mock('../../src/js/store/use-app')

describe('map-error', () => {
  it('should show message', () => {
    jest.mocked(useApp).mockReturnValue({
      error: {
        message: 'Test error message'
      }
    })

    const { container } = render(<MapError />)

    expect(container.querySelector('p').textContent).toEqual('Test error message')
  })
})
