// src/core/renderers/mapPanels.test.js
import React from 'react'
import { render } from '@testing-library/react'
import { mapPanels } from './mapPanels.js'
import { getPanelConfig } from '../registry/panelRegistry.js'
import { registeredPlugins } from '../registry/pluginRegistry.js'
import { withPluginContexts } from './pluginWrapper.js'

// Mocks
jest.mock('../registry/panelRegistry.js')
jest.mock('../registry/pluginRegistry.js', () => ({ registeredPlugins: [] }))
jest.mock('./pluginWrapper.js', () => ({ withPluginContexts: jest.fn((c) => c) }))
jest.mock('../components/Panel/Panel.jsx', () => ({
  Panel: (props) => <div data-testid='panel' {...props} />
}))
jest.mock('./slots.js', () => ({ allowedSlots: { panel: ['header', 'modal'] } }))

const mockGetPanelConfig = getPanelConfig

const TestPanels = (props) => {
  const result = mapPanels(props)
  return <div data-testid='result'>{JSON.stringify(result)}</div>
}

describe('mapPanels', () => {
  const baseConfig = {
    p1: {
      desktop: { slot: 'header', order: 1 },
      includeModes: ['view'],
      pluginId: 'plug1'
    }
  }

  const commonProps = {
    slot: 'header',
    breakpoint: 'desktop',
    mode: 'view',
    openPanels: { p1: { props: { foo: 'bar' } } }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    registeredPlugins.length = 0
    mockGetPanelConfig.mockReturnValue(baseConfig)
  })

  it('returns empty when no panels', () => {
    mockGetPanelConfig.mockReturnValue({})
    const { getByTestId } = render(<TestPanels {...commonProps} />)
    expect(getByTestId('result').textContent).toBe('[]')
  })

  it('returns null if config missing', () => {
    mockGetPanelConfig.mockReturnValue({})
    const result = mapPanels({ ...commonProps, openPanels: { missing: { props: {} } } })
    expect(result).toEqual([])
  })

  it('returns null if bpConfig missing', () => {
    mockGetPanelConfig.mockReturnValue({ p1: {} })
    const result = mapPanels(commonProps)
    expect(result).toEqual([])
  })

  it('skips if slot not allowed', () => {
    mockGetPanelConfig.mockReturnValue({ p1: { desktop: { slot: 'not-allowed' } } })
    const result = mapPanels(commonProps)
    expect(result).toEqual([])
  })

  it('skips if not in includeModes whitelist', () => {
    mockGetPanelConfig.mockReturnValue({ p1: { ...baseConfig.p1, includeModes: ['edit'] } })
    const result = mapPanels(commonProps)
    expect(result).toEqual([])
  })

  it('skips if in excludeModes', () => {
    mockGetPanelConfig.mockReturnValue({ p1: { ...baseConfig.p1, excludeModes: ['view'] } })
    const result = mapPanels(commonProps)
    expect(result).toEqual([])
  })

  it('skips if targetSlot !== slot', () => {
    mockGetPanelConfig.mockReturnValue({ p1: { desktop: { slot: 'sidebar' }, includeModes: ['view'] } })
    const result = mapPanels(commonProps)
    expect(result).toEqual([])
  })

  it('skips panel when targetSlot !== requested slot', () => {
    // Panel is a modal (targetSlot === 'modal', which is allowed in tests)
    mockGetPanelConfig.mockReturnValue({ p1: { desktop: { modal: true }, includeModes: ['view'] } })
    // We request slot 'header' — targetSlot ('modal') !== slot ('header'), so it should be skipped
    const result = mapPanels({ ...commonProps, slot: 'header' })
    expect(result).toEqual([]) // returns nothing because targetSlot !== slot
  })

  it('only allows last opened modal', () => {
    mockGetPanelConfig.mockReturnValue({
      p1: { desktop: { modal: true }, includeModes: ['view'] },
      p2: { desktop: { modal: true }, includeModes: ['view'] }
    })
    const result = mapPanels({ ...commonProps, openPanels: { p1: {}, p2: {} }, slot: 'modal' })
    expect(result.map(r => r.id)).toEqual(['p2'])
  })

  it('wraps render with plugin context when render defined', () => {
    const renderFn = jest.fn(() => <div>child</div>)
    registeredPlugins.push({ id: 'plug1', config: { a: 1 } })
    mockGetPanelConfig.mockReturnValue({ p1: { ...baseConfig.p1, render: renderFn } })
    const result = mapPanels(commonProps)
    expect(withPluginContexts).toHaveBeenCalledWith(renderFn, expect.objectContaining({ pluginId: 'plug1' }))
    expect(result[0].type).toBe('panel')
  })

  it('sets WrappedChild null when no render', () => {
    const result = mapPanels(commonProps)
    expect(result[0].element.props.WrappedChild).toBeNull()
  })

  it('falls back to order 0 when missing', () => {
    mockGetPanelConfig.mockReturnValue({ p1: { desktop: { slot: 'header' }, includeModes: ['view'] } })
    const result = mapPanels(commonProps)
    expect(result[0].order).toBe(0)
  })
})
