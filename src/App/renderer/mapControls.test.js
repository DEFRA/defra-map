import React from 'react'
import { render } from '@testing-library/react'
import { mapControls } from './mapControls.js'
import { getControlConfig } from '../registry/controlRegistry.js'

// Mock dependencies
jest.mock('../registry/controlRegistry.js')
jest.mock('./pluginWrapper.js', () => ({
  withPluginContexts: (Comp) => Comp || (() => null)
}))
jest.mock('../registry/pluginRegistry.js', () => ({
  registeredPlugins: [
    { id: 'plugin1', manifest: { controls: [{ id: 'ctrl1' }] }, config: { foo: 'bar' } }
  ]
}))
jest.mock('./slots.js', () => ({
  allowedSlots: { control: ['header', 'sidebar'] }
}))

const mockGetControlConfig = getControlConfig

describe('mapControls', () => {
  const defaultAppState = { breakpoint: 'desktop', mode: 'view' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty array when no controls', () => {
    mockGetControlConfig.mockReturnValue({})
    const result = mapControls({ slot: 'header', appState: defaultAppState })
    expect(result).toEqual([])
  })

  it('filters controls by slot and allowedSlots', () => {
    mockGetControlConfig.mockReturnValue({
      ctrl1: { id: 'ctrl1', desktop: { slot: 'header', order: 1 }, includeModes: ['view'] },
      ctrl2: { id: 'ctrl2', desktop: { slot: 'footer', order: 2 }, includeModes: ['view'] } // filtered out
    })
    const result = mapControls({ slot: 'header', appState: defaultAppState })
    expect(result.map(c => c.id)).toEqual(['ctrl1'])
  })

  it('filters out controls missing breakpoint config', () => {
    mockGetControlConfig.mockReturnValue({
      ctrl1: { id: 'ctrl1', mobile: { slot: 'header', order: 1 }, includeModes: ['view'] } // no desktop config
    })
    const result = mapControls({ slot: 'header', appState: defaultAppState })
    expect(result).toEqual([])
  })

  it('filters controls by includeModes whitelist', () => {
    mockGetControlConfig.mockReturnValue({
      ctrl1: { id: 'ctrl1', desktop: { slot: 'header', order: 1 }, includeModes: ['edit'] } // not matching 'view'
    })
    const result = mapControls({ slot: 'header', appState: defaultAppState })
    expect(result).toEqual([])
  })

  it('filters controls by excludeModes', () => {
    mockGetControlConfig.mockReturnValue({
      ctrl1: { id: 'ctrl1', desktop: { slot: 'header', order: 1 }, excludeModes: ['view'] } // excluded
    })
    const result = mapControls({ slot: 'header', appState: defaultAppState })
    expect(result).toEqual([])
  })

  it('maps controls to wrapped component with order', () => {
    mockGetControlConfig.mockReturnValue({
      ctrl1: { id: 'ctrl1', desktop: { slot: 'header', order: 5 }, render: () => <div>R</div>, includeModes: ['view'] }
    })
    const result = mapControls({ slot: 'header', appState: defaultAppState })
    expect(result[0].order).toBe(5)
    expect(result[0].id).toBe('ctrl1')
  })

  it('falls back to order 0 if missing', () => {
    mockGetControlConfig.mockReturnValue({
      ctrl1: { id: 'ctrl1', desktop: { slot: 'header' }, render: () => <div />, includeModes: ['view'] }
    })
    const result = mapControls({ slot: 'header', appState: defaultAppState })
    expect(result[0].order).toBe(0)
  })

  it('wraps with plugin contexts when plugin matches', () => {
    mockGetControlConfig.mockReturnValue({
      ctrl1: { id: 'ctrl1', desktop: { slot: 'header', order: 1 }, render: () => <div />, includeModes: ['view'] }
    })
    const result = mapControls({ slot: 'header', appState: defaultAppState })
    expect(typeof result[0].element.type).toBe('function')
  })
})
