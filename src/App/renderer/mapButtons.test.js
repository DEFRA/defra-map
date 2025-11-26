import React from 'react'
import { mapButtons, getMatchingButtons, renderButton } from './mapButtons.js'
import { getButtonConfig } from '../registry/buttonRegistry.js'

jest.mock('../registry/buttonRegistry.js')
jest.mock('../components/MapButton/MapButton.jsx', () => ({ 
  MapButton: (props) => <button data-testid="map-button" {...props} /> 
}))
jest.mock('./slots.js', () => ({ 
  allowedSlots: { button: ['header', 'sidebar'] } 
}))

describe('mapButtons module', () => {
  const baseBtn = { iconId: 'i1', label: 'Btn', desktop: { slot: 'header', order: 1, showLabel: true }, includeModes: ['view'] }
  const appState = { breakpoint: 'desktop', mode: 'view', openPanels: {}, dispatch: jest.fn(), disabledButtons: new Set(), hiddenButtons: new Set(), pressedButtons: new Set() }
  const appConfig = { id: 'test' }

  beforeEach(() => {
    jest.clearAllMocks()
    getButtonConfig.mockReturnValue({})
    Object.defineProperty(document, 'activeElement', { 
      value: document.createElement('div'), 
      writable: true,
      configurable: true
    })
  })

  describe('getMatchingButtons', () => {
    const testFilter = (config, expected) => {
      expect(getMatchingButtons({ buttonConfig: config, slot: 'header', appState, appConfig }).length).toBe(expected)
    }

    it('handles missing config', () => testFilter(null, 0))
    it('filters by slot', () => testFilter({ b1: { ...baseBtn, desktop: { slot: 'sidebar' } } }, 0))
    it('filters by includeModes', () => testFilter({ b1: { ...baseBtn, includeModes: ['edit'] } }, 0))
    it('filters by excludeModes', () => testFilter({ b1: { ...baseBtn, excludeModes: ['view'] } }, 0))
    it('filters invalid slots', () => testFilter({ b1: { ...baseBtn, desktop: { slot: 'invalid' } } }, 0))
    it('defaults includeModes/excludeModes', () => testFilter({ b1: { ...baseBtn, includeModes: undefined, excludeModes: undefined } }, 1))
    it('matches valid buttons', () => testFilter({ b1: baseBtn, b2: baseBtn }, 2))
  })

  describe('renderButton', () => {
    const render = (config, state = appState, flags = {}) => 
      renderButton({ btn: ['id', config], appState: state, appConfig, groupStart: false, groupMiddle: false, groupEnd: false, ...flags })

    it('renders basic props', () => {
      const result = render(baseBtn)
      expect(result.props).toMatchObject({ buttonId: 'id', iconId: 'i1', label: 'Btn', showLabel: true })
    })

    it('handles group flags', () => {
      const result = render(baseBtn, appState, { groupStart: true, groupEnd: true })
      expect(result.props).toMatchObject({ groupStart: true, groupEnd: true })
    })

    it('evaluates dynamic label', () => {
      const label = jest.fn(() => 'Dynamic')
      expect(render({ ...baseBtn, label }).props.label).toBe('Dynamic')
      expect(label).toHaveBeenCalledWith({ appState, appConfig })
    })

    it('evaluates dynamic href', () => {
      const href = jest.fn(() => 'url')
      expect(render({ ...baseBtn, href }).props.href).toBe('url')
    })

    it('calls custom onClick', () => {
      const onClick = jest.fn()
      render({ ...baseBtn, onClick }).props.onClick({})
      expect(onClick).toHaveBeenCalledWith({}, { appState, appConfig })
    })

    it('opens panel', () => {
      render({ ...baseBtn, panelId: 'p1' }).props.onClick()
      expect(appState.dispatch).toHaveBeenCalledWith({ type: 'OPEN_PANEL', payload: { panelId: 'p1', props: { triggeringElement: document.activeElement } } })
    })

    it('closes panel', () => {
      render({ ...baseBtn, panelId: 'p1' }, { ...appState, openPanels: { p1: true } }).props.onClick()
      expect(appState.dispatch).toHaveBeenCalledWith({ type: 'CLOSE_PANEL', payload: 'p1' })
    })

    it('does nothing without panelId or onClick', () => {
      render(baseBtn).props.onClick()
      expect(appState.dispatch).not.toHaveBeenCalled()
    })

    it('handles disabled/hidden/pressed state', () => {
      const state = { ...appState, disabledButtons: new Set(['id']), hiddenButtons: new Set(['id']), pressedButtons: new Set(['id']) }
      const result = render({ ...baseBtn, pressedWhen: jest.fn() }, state)
      expect(result.props).toMatchObject({ isDisabled: true, isHidden: true, isPressed: true })
    })

    it('sets isPressed undefined without pressedWhen', () => {
      expect(render(baseBtn, { ...appState, pressedButtons: new Set(['id']) }).props.isPressed).toBeUndefined()
    })

    it('falls back to empty breakpoint config', () => {
      expect(render(baseBtn, { ...appState, breakpoint: 'mobile' }).props.showLabel).toBeUndefined()
    })
  })

  describe('mapButtons', () => {
    const map = () => mapButtons({ slot: 'header', appState, appConfig })

    it('returns empty for no config', () => {
      expect(map()).toEqual([])
    })

    it('returns flat list with type and order', () => {
      getButtonConfig.mockReturnValue({ b1: baseBtn })
      const result = map()
      expect(result[0]).toMatchObject({ id: 'b1', type: 'button', order: 1 })
    })

    it('sets group flags for 2 buttons', () => {
      getButtonConfig.mockReturnValue({ 
        b1: { ...baseBtn, group: 'g1' }, 
        b2: { ...baseBtn, desktop: { slot: 'header', order: 2 }, group: 'g1' } 
      })
      const result = map()
      expect(result[0].element.props).toMatchObject({ groupStart: true, groupEnd: false })
      expect(result[1].element.props).toMatchObject({ groupStart: false, groupEnd: true })
    })

    it('sets groupMiddle for 3+ buttons', () => {
      getButtonConfig.mockReturnValue({ 
        b1: { ...baseBtn, desktop: { slot: 'header', order: 1 }, group: 'g1' },
        b2: { ...baseBtn, desktop: { slot: 'header', order: 2 }, group: 'g1' },
        b3: { ...baseBtn, desktop: { slot: 'header', order: 3 }, group: 'g1' }
      })
      expect(map()[1].element.props.groupMiddle).toBe(true)
    })

    it('ignores singleton groups', () => {
      getButtonConfig.mockReturnValue({ b1: { ...baseBtn, group: 'g1' } })
      expect(map()[0].element.props).toMatchObject({ groupStart: false, groupEnd: false })
    })

    it('falls back to order 0', () => {
      getButtonConfig.mockReturnValue({ b1: { ...baseBtn, desktop: { slot: 'header' } } })
      expect(map()[0].order).toBe(0)
    })
  })
})
