import React from 'react'
import { render } from '@testing-library/react'
import { getButtonGroups, renderButton, mapButtons } from './mapButtons.js'
import { getButtonConfig } from '../registry/buttonRegistry.js'

// Mocks
jest.mock('../registry/buttonRegistry.js')
jest.mock('../components/MapButton/MapButton.jsx', () => ({ MapButton: (props) => <button data-testid='map-button' {...props} /> }))
jest.mock('./slots.js', () => ({ allowedSlots: { button: ['header', 'sidebar'] } }))

const mockGetButtonConfig = getButtonConfig

describe('mapButtons module', () => {
  const buttonConfig = {
    btn1: { iconId: 'icon1', label: 'Button 1', desktop: { slot: 'header', order: 1, showLabel: true }, includeModes: ['view'], group: 'group1' },
    btn2: { iconId: 'icon2', label: 'Button 2', desktop: { slot: 'header', order: 2, showLabel: false }, includeModes: ['view'], group: 'group1', panelId: 'panel1', onClick: jest.fn() }
  }

  const commonProps = { slot: 'header', breakpoint: 'desktop', mode: 'view', openPanels: { panel1: true }, dispatch: jest.fn(), disabledButtons: new Set(['btn1']), hiddenButtons: new Set(), id: 'test' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetButtonConfig.mockReturnValue(buttonConfig)
    Object.defineProperty(document, 'activeElement', { value: document.createElement('div'), writable: true })
  })

  // ---------------- getButtonGroups ----------------
  describe('getButtonGroups', () => {
    it('returns [] if no config', () => {
      expect(getButtonGroups({ ...commonProps, buttonConfig: null })).toEqual([])
      expect(getButtonGroups({ ...commonProps, buttonConfig: undefined })).toEqual([])
    })

    it('skips missing breakpoint config', () => {
      expect(getButtonGroups({ ...commonProps, buttonConfig: { btn1: { ...buttonConfig.btn1, desktop: undefined } } })).toEqual([])
    })

    it('filters buttons by slot/mode', () => {
      const result = getButtonGroups({ ...commonProps, buttonConfig })
      expect(result).toHaveLength(1)
      expect(result[0].buttons).toHaveLength(2)
    })

    it('returns [] when no matches', () => {
      expect(getButtonGroups({ ...commonProps, buttonConfig, slot: 'footer' })).toEqual([])
    })

    it('filters by include/excludeModes', () => {
      expect(getButtonGroups({ ...commonProps, buttonConfig: { ...buttonConfig, btn1: { ...buttonConfig.btn1, includeModes: ['edit'] } } })[0].buttons).toHaveLength(1)
      expect(getButtonGroups({ ...commonProps, buttonConfig: { ...buttonConfig, btn1: { ...buttonConfig.btn1, excludeModes: ['view'] } } })[0].buttons).toHaveLength(1)
    })

    it('groups adjacent buttons', () => {
      const config = { ...buttonConfig, btn2: { ...buttonConfig.btn2, group: 'group2' } }
      expect(getButtonGroups({ ...commonProps, buttonConfig: config })).toHaveLength(2)
    })

    it('filters invalid slots', () => {
      expect(getButtonGroups({ ...commonProps, buttonConfig: { btn1: { desktop: { slot: 'footer', order: 1, showLabel: true }, label: 'X' } } })).toEqual([])
      expect(getButtonGroups({ ...commonProps, buttonConfig: { btn1: { desktop: { slot: 'not-allowed', order: 1, showLabel: true }, label: 'X' } } })).toEqual([])
    })

    it('filters include/exclude modes that block', () => {
      expect(getButtonGroups({ ...commonProps, buttonConfig: { btn1: { desktop: { slot: 'header', order: 1, showLabel: true }, label: 'X', includeModes: ['edit'] } } })).toEqual([])
      expect(getButtonGroups({ ...commonProps, buttonConfig: { btn1: { desktop: { slot: 'header', order: 1, showLabel: true }, label: 'X', excludeModes: ['view'] } } })).toEqual([])
    })
  })

  // ---------------- renderButton ----------------
  describe('renderButton', () => {
    it('renders with correct props', () => {
      const btn = renderButton(['btn1', buttonConfig.btn1], 'desktop', commonProps.openPanels, commonProps.dispatch, commonProps.disabledButtons, commonProps.hiddenButtons, 'test')
      expect(btn.props).toMatchObject({ buttonId: 'btn1', isDisabled: true, isOpen: false })
    })

    it('calls onClick if provided', () => {
      const btn = renderButton(['btn2', buttonConfig.btn2], 'desktop', commonProps.openPanels, commonProps.dispatch, new Set(), new Set(), 'test')
      btn.props.onClick()
      expect(buttonConfig.btn2.onClick).toHaveBeenCalled()
    })

    it('dispatches OPEN_PANEL and CLOSE_PANEL correctly', () => {
      const dispatch = jest.fn()
      renderButton(['btn2', { ...buttonConfig.btn2, onClick: undefined }], 'desktop', { panel1: false }, dispatch, new Set(), new Set(), 'test').props.onClick()
      expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN_PANEL', payload: { panelId: 'panel1', props: { triggeringElement: document.activeElement } } })
      renderButton(['btn1', { ...buttonConfig.btn1, panelId: 'panel1', onClick: undefined }], 'desktop', { panel1: true }, dispatch, new Set(), new Set(), 'test').props.onClick()
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_PANEL', payload: 'panel1' })
    })

    it('does nothing if no panelId or onClick', () => {
      const dispatch = jest.fn()
      renderButton(['btn1', { ...buttonConfig.btn1, panelId: undefined, onClick: undefined }], 'desktop', {}, dispatch, new Set(), new Set(), 'test').props.onClick()
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  // ---------------- mapButtons ----------------
  const TestButtons = (props) => {
    return <div data-testid='result'>{JSON.stringify(mapButtons(props).map(({ id, type, order }) => ({ id, type, order })))}</div>
  }

  describe('mapButtons', () => {
    it('returns [] when no config', () => {
      mockGetButtonConfig.mockReturnValue({})
      const { getByTestId } = render(<TestButtons {...commonProps} />)
      expect(JSON.parse(getByTestId('result').textContent)).toEqual([])
    })

    it('returns group type for grouped buttons', () => {
      const { getByTestId } = render(<TestButtons {...commonProps} />)
      expect(JSON.parse(getByTestId('result').textContent)[0].type).toBe('group')
    })

    it('handles single button fallback', () => {
      mockGetButtonConfig.mockReturnValue({ btn1: { ...buttonConfig.btn1, group: undefined } })
      const { getByTestId } = render(<TestButtons {...commonProps} />)
      expect(JSON.parse(getByTestId('result').textContent)[0]).toMatchObject({ type: 'button', order: 1 })
    })

    it('uses first button id if groupKey missing', () => {
      mockGetButtonConfig.mockReturnValue({
        btn1: { iconId: 'i1', desktop: { slot: 'header', order: 1, showLabel: true }, includeModes: ['view'] },
        btn2: { iconId: 'i2', desktop: { slot: 'header', order: 2, showLabel: true }, includeModes: ['view'] }
      })
      const { getByTestId } = render(<TestButtons {...commonProps} />)
      expect(JSON.parse(getByTestId('result').textContent)[0].id).toBe('group-btn1')
    })

    it('falls back to order 0 if missing', () => {
      mockGetButtonConfig.mockReturnValue({ btn1: { iconId: 'i1', desktop: { slot: 'header', showLabel: true }, includeModes: ['view'] } })
      const { getByTestId } = render(<TestButtons {...commonProps} />)
      expect(JSON.parse(getByTestId('result').textContent)[0].order).toBe(0)
    })

    it('falls back to 0 when order is missing in grouped buttons', () => {
      mockGetButtonConfig.mockReturnValue({
        btn1: { desktop: { slot: 'header', showLabel: true }, includeModes: ['view'], group: 'g' },
        btn2: { desktop: { slot: 'header', showLabel: true }, includeModes: ['view'], group: 'g' }
      })
      const { getByTestId } = render(<TestButtons {...commonProps} />)
      expect(JSON.parse(getByTestId('result').textContent)[0].order).toBe(0)
    })
  })
})
