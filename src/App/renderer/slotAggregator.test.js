import { getSlotItems } from './slotAggregator.js'
import * as mapControlsModule from './mapControls.js'
import * as mapPanelsModule from './mapPanels.js'
import * as mapButtonsModule from './mapButtons.js'

describe('getSlotItems', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns combined and sorted slot items from controls, panels, and buttons', () => {
    jest.spyOn(mapControlsModule, 'mapControls').mockReturnValue([
      { id: 'control1', order: 3, type: 'control' }
    ])
    jest.spyOn(mapPanelsModule, 'mapPanels').mockReturnValue([
      { id: 'panel1', order: 1, type: 'panel' }
    ])
    jest.spyOn(mapButtonsModule, 'mapButtons').mockReturnValue([
      { id: 'button1', order: 2, type: 'button' }
    ])

    const args = { slot: 'header', breakpoint: 'desktop', mode: 'view', openPanels: {} }
    const result = getSlotItems(args)

    expect(result).toEqual([
      { id: 'panel1', order: 1, type: 'panel' },
      { id: 'button1', order: 2, type: 'button' },
      { id: 'control1', order: 3, type: 'control' }
    ])
  })
})
