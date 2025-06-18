import React from 'react'
import { render } from '@testing-library/react'
import Provider from '../src/js/provider/maplibre/framework'
import Geocode from '../src/js/provider/os-open-names/geocode'
import ReverseGeocode from '../src/js/provider/os-open-names-reverse/reverse-geocode'

import App from '../src/app'

jest.mock('../src/js/components/container.jsx', () => () => <div id='container' />)

describe('App', () => {
  let div

  beforeAll(() => {
    div = document.createElement('div')
    div.setAttribute('id', 'app')
    document.body.append(div)
  })

  beforeEach(() => {
    global.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render element', () => {
    const appEl = document.querySelector('#app')

    render(
      <App
        parent={document.querySelector('#app')}
        mapProvider={Provider}
        geocodeProvider={Geocode}
        reverseGeocodeProvider={ReverseGeocode}
        styles={[{
          name: 'default',
          attribution: '',
          url: ''
        }]}
      />
    )

    expect(appEl.firstChild).toEqual(null)
  })

  it('should attach to container element via createPortal', () => {
    const appEl = document.querySelector('#app')
    const containerEl = document.querySelector('#container')

    render(
      <App
        parent={document.querySelector('#app')}
        mapProvider={Provider}
        geocodeProvider={Geocode}
        reverseGeocodeProvider={ReverseGeocode}
        container={containerEl}
        styles={[{
          name: 'default',
          attribution: '',
          url: ''
        }]}
      />
    )

    expect(appEl.firstChild).toEqual(containerEl)
  })
})
