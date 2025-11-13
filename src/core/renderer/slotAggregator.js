// src/core/renderers/slotAggregator.js
import { mapControls } from './mapControls.js'
import { mapPanels } from './mapPanels.js'
import { mapButtons } from './mapButtons.js'

export function getSlotItems (args) {
  const controls = mapControls(args)
  const panels = mapPanels(args)
  const buttons = mapButtons(args)

  return [...controls, ...panels, ...buttons].sort((a, b) => a.order - b.order)
}
