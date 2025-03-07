import React from 'react'
import { act } from '@testing-library/react'

import root from '../src/root'

jest.mock('../src/app', () => () => <div>App</div>)

describe('root', () => {
  it('should render component', () => {
    const div = document.createElement('div')
    div.setAttribute('id', 'test')

    document.body.append(div)

    act(() => {
      root(document.querySelector('#test'), { mode: 'test' })
    })

    expect(root).toBeTruthy()
  })
})
