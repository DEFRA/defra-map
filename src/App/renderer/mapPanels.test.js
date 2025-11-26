import React from 'react'
import { mapPanels } from './mapPanels.js'
import { getPanelConfig } from '../registry/panelRegistry.js'
import { registeredPlugins } from '../registry/pluginRegistry.js'
import { withPluginContexts } from './pluginWrapper.js'

jest.mock('../registry/panelRegistry.js')
jest.mock('../registry/pluginRegistry.js', () => ({ registeredPlugins: [] }))
jest.mock('./pluginWrapper.js', () => ({ withPluginContexts: jest.fn((c) => c) }))
jest.mock('../components/Panel/Panel.jsx', () => ({ Panel: (props) => <div data-testid="panel" {...props} />}))
jest.mock('./slots.js', () => ({ allowedSlots: { panel: ['header', 'modal'] } }))

describe('mapPanels', () => {
  const baseConfig = { desktop: { slot: 'header', order: 1 }, includeModes: ['view'], pluginId: 'plug1' }
  const defaultAppState = { breakpoint: 'desktop', mode: 'view', openPanels: { p1: { props: { foo: 'bar' } } } }

  const map = (state = defaultAppState, slot = 'header') =>
    mapPanels({ slot, appState: state })

  beforeEach(() => {
    jest.clearAllMocks()
    registeredPlugins.length = 0
    getPanelConfig.mockReturnValue({ p1: baseConfig })
  })

  it('returns empty when no panels are open', () => {
    expect(map({ ...defaultAppState, openPanels: {} })).toEqual([])
  })

  it('returns null if panel config is missing', () => {
    getPanelConfig.mockReturnValue({})
    const result = map()
    expect(result).toEqual([])
  })

  it('returns null if bpConfig is missing', () => {
    getPanelConfig.mockReturnValue({ p1: {} }) // no 'desktop' key
    const result = map()
    expect(result).toEqual([])
  })

  it('returns null if panel slot does not match the requested slot', () => {
    const panelId = 'p1'
    // The panel has a valid slot ('header'), but we request 'sidebar'
    getPanelConfig.mockReturnValue({ [panelId]: { desktop: { slot: 'header' }, includeModes: ['view'] } })
    const state = { ...defaultAppState, openPanels: { [panelId]: { props: {} } } }
    const result = map(state, 'sidebar')
    expect(result).toEqual([])
  })

  it('skips invalid panels', () => {
    getPanelConfig.mockReturnValue({
      p1: { desktop: { slot: 'invalid' }, includeModes: ['view'] },
      p2: { desktop: { slot: 'header' }, includeModes: ['edit'] },
      p3: { desktop: { slot: 'header' }, excludeModes: ['view'] },
      p4: { desktop: { modal: true }, includeModes: ['view'] }
    })

    const result = map()
    expect(result).toEqual([])
  })

  it('only allows last opened modal', () => {
    getPanelConfig.mockReturnValue({
      p1: { desktop: { modal: true }, includeModes: ['view'] },
      p2: { desktop: { modal: true }, includeModes: ['view'] }
    })
    const result = map({ ...defaultAppState, openPanels: { p1: { props: {} }, p2: { props: {} } } }, 'modal')
    expect(result.map(r => r.id)).toEqual(['p2'])
  })

  it('wraps render with plugin context', () => {
    const renderFn = jest.fn(() => <div>child</div>)
    registeredPlugins.push({ id: 'plug1', config: { a: 1 } })
    getPanelConfig.mockReturnValue({ p1: { ...baseConfig, render: renderFn } })

    map()
    expect(withPluginContexts).toHaveBeenCalledWith(renderFn,
      expect.objectContaining({ pluginId: 'plug1', pluginConfig: { a: 1 }, foo: 'bar' })
    )
  })

  it('sets WrappedChild null when no render', () => {
    const result = map()
    expect(result[0].element.props.WrappedChild).toBeNull()
  })

  it('returns correct structure with defaults', () => {
    getPanelConfig.mockReturnValue({ p1: { desktop: { slot: 'header' }, includeModes: ['view'] } })
    const result = map()
    expect(result[0]).toMatchObject({ id: 'p1', type: 'panel', order: 0 })
    expect(result[0].element.props).toMatchObject({ panelId: 'p1', props: { foo: 'bar' } })
  })

  it('allows panel next to button', () => {
    const panelId = 'p-1'
    getPanelConfig.mockReturnValue({ [panelId]: { desktop: { slot: 'p-1-button' }, includeModes: ['view'] } })
    const state = { ...defaultAppState, openPanels: { [panelId]: { props: {} } } }
    const panels = map(state, 'p-1-button')
    expect(panels).toHaveLength(1)
  })

  it('handles missing plugin config and defaults modes', () => {
    registeredPlugins.push({ id: 'plug1' })
    getPanelConfig.mockReturnValue({ p1: { desktop: { slot: 'header' }, pluginId: 'plug1' } })
    expect(map()).toHaveLength(1) // includeModes/excludeModes default properly
  })
})
