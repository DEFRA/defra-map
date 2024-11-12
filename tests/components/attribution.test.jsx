import React from 'react'
import { render } from '@testing-library/react'

import Attribution from '../../src/js/components/attribution'
import { useApp } from '../../src/js/store/use-app'
import { useViewport } from '../../src/js/store/use-viewport'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/store/use-viewport')

jest.mocked(useApp).mockReturnValue({
  provider: {
    attribution: { logo: true, label: true }
  }
})

describe('attribution', () => {
  it('should render default logo', () => {
    jest.mocked(useViewport).mockReturnValue({
      basemap: 'default'
    })

    const { container } = render(<Attribution />)

    expect(container.querySelector('path[fill="#fff"]')).toBeTruthy()
  })

  it('should render the dark mode logo', () => {
    jest.mocked(useViewport).mockReturnValue({
      basemap: 'dark'
    })

    const { container } = render(<Attribution />)

    expect(container.querySelector('path[fill="#000"]')).toBeTruthy()
  })
})
