import { createButton } from './buttonManager.js'
import defaults from '../config/defaults.js'

describe('createButton', () => {
  let rootEl, onClick, button

  beforeEach(() => {
    window.history.replaceState({}, '', '/test?foo=bar')
    rootEl = document.createElement('div')
    document.body.appendChild(rootEl)
    onClick = jest.fn()
    jest.spyOn(history, 'pushState').mockImplementation(() => {})
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.restoreAllMocks()
  })

  it('creates button with correct attributes and inserts before rootEl', () => {
    button = createButton({ id: 'map', buttonText: 'View Map' }, rootEl, onClick)

    const expectedHref = new URL(window.location.href)
    expectedHref.searchParams.set(defaults.mapViewParamKey, 'map')

    expect(button.getAttribute('href')).toBe(expectedHref.toString())
    expect(button.className).toBe('am-c-btn-tertiary')
    expect(button.getAttribute('role')).toBe('button')
    expect(button.textContent).toContain('View Map')
    expect(button.nextElementSibling).toBe(rootEl)
  })

  it('prevents default and calls pushState and onClick on click', () => {
    button = createButton({ id: 'map', buttonText: 'View Map' }, rootEl, onClick)

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault')

    button.dispatchEvent(clickEvent)

    const expectedHref = new URL(window.location.href)
    expectedHref.searchParams.set(defaults.mapViewParamKey, 'map')

    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(history.pushState).toHaveBeenCalledWith(
      { isBack: true },
      '',
      expectedHref.toString()
    )
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('appends map view param without removing existing query params', () => {
    button = createButton({ id: 'map', buttonText: 'View Map' }, rootEl, onClick)

    const url = new URL(button.getAttribute('href'))
    expect(url.searchParams.get('foo')).toBe('bar') // original param preserved
    expect(url.searchParams.get(defaults.mapViewParamKey)).toBe('map') // new param added
  })
})
