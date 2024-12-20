import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import QueryButton from '../../src/js/components/query-button'
import { useApp } from '../../src/js/store/use-app'
import eventBus from '../../src/js/lib/eventbus'
import { events } from '../../src/js/store/constants'

jest.mock('../../src/js/store/use-app')
jest.mock('../../src/js/lib/eventbus')

describe('QueryButton', () => {
  let mockUseApp

  beforeEach(() => {
    mockUseApp = {
      parent: 'test-parent',
      queryPolygon: { submitLabel: 'Submit' },
      query: 'test-query'
    }
    useApp.mockReturnValue(mockUseApp)
  })

  it('should render the button with the correct label', () => {
    render(<QueryButton />)
    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toBeInTheDocument()
  })

  it('should dispatch an event with the correct details when clicked', () => {
    render(<QueryButton />)
    const button = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(button)
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      'test-parent',
      events.APP_QUERY,
      { resultType: 'polygon', query: 'test-query' }
    )
  })
})
