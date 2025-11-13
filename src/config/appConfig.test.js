// appConfig.test.jsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { appConfig } from './appConfig'
import { KeyboardHelp } from '../core/components/KeyboardHelp/KeyboardHelp.jsx'

describe('appConfig', () => {
  test('render function should render KeyboardHelp component', () => {
    const panel = appConfig.panels.find(p => p.id === 'keyboardHelp')
    const { container } = render(panel.render())

    // Check if a div with the expected class exists
    expect(container.querySelector('.am-c-keyboard-help')).toBeInTheDocument()
  })
})

