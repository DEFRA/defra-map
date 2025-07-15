import React from 'react'
import { screen, render } from '@testing-library/react'

import Keyboard from '../../src/js/components/keyboard'

describe('keyboard', () => {
  it('should render keyboard', () => {
    const { container } = render(<Keyboard />)

    expect(container.querySelector('.fm-c-keyboard-list')).toBeTruthy()
    expect(container.querySelectorAll('.fm-c-keyboard-list__item').length).toEqual(7)

    expect(screen.getByText('Select a map control')).toBeTruthy()
    expect(screen.getByText('Move in large steps')).toBeTruthy()
    expect(screen.getByText('Move in small steps')).toBeTruthy()
    expect(screen.getByText('Adjust zoom level')).toBeTruthy()
    expect(screen.getByText('Select feature (when 9 or fewer)')).toBeTruthy()
    expect(screen.getByText('Get feature information')).toBeTruthy()
  })
})
