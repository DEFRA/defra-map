import { updateDOMState, removeLoadingState } from './domStateManager.js'
import * as queryString from '../utils/queryString.js'
import * as detectBreakpoint from '../utils/detectBreakpoint.js'
import * as toggleInertElements from '../utils/toggleInertElements.js'

jest.mock('../utils/queryString.js')
jest.mock('../utils/detectBreakpoint.js')
jest.mock('../utils/toggleInertElements.js')

describe('updateDOMState', () => {
  let mapInstance, rootEl

  beforeEach(() => {
    rootEl = document.createElement('div')
    document.body.appendChild(rootEl)
    document.title = 'Original Title'
    mapInstance = {
      config: { id: 'map', pageTitle: 'Map View', behaviour: 'mapOnly', containerHeight: '500px' },
      rootEl
    }
    jest.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.classList.remove('dm-is-fullscreen')
  })

  it.each([
    ['mapOnly', 'desktop', null, true, '100%', false],
    ['buttonFirst', 'desktop', null, false, 'auto', false],
    ['buttonFirst', 'desktop', 'map', true, '100%', true],
    ['hybrid', 'desktop', null, false, '500px', false],
    ['hybrid', 'mobile', null, false, 'auto', false],
    ['hybrid', 'mobile', 'map', true, '100%', true],
    ['inline', 'desktop', null, false, '500px', false]
  ])('%s on %s with view=%s', (behaviour, breakpoint, viewParam, isFullscreen, height, titleUpdated) => {
    mapInstance.config.behaviour = behaviour
    detectBreakpoint.getBreakpoint.mockReturnValue(breakpoint)
    queryString.getQueryParam.mockReturnValue(viewParam)

    updateDOMState(mapInstance)

    expect(document.documentElement.classList.contains('dm-is-fullscreen')).toBe(isFullscreen)
    expect(rootEl.style.height).toBe(height)
    if (titleUpdated) {
      expect(document.title).toBe('Map View: Original Title')
    }
    if (behaviour !== 'inline') {
      expect(toggleInertElements.toggleInertElements).toHaveBeenCalledWith({ 
        containerEl: rootEl, 
        isFullscreen 
      })
    }
  })
})

describe('removeLoadingState', () => {
  it('removes dm-is-loading class from body', () => {
    document.body.classList.add('dm-is-loading')
    removeLoadingState()
    expect(document.body.classList.contains('dm-is-loading')).toBe(false)
  })
})