// src/core/renderers/slotAggregator.js
import { mapControls } from './mapControls.js'
import { mapPanels } from './mapPanels.js'
import { mapButtons } from './mapButtons.js'

export function getSlotItems ({ evaluateProp, ...args }) {
  const controls = mapControls({ evaluateProp, ...args })
  const panels = mapPanels({ evaluateProp, ...args })
  const buttons = mapButtons({ evaluateProp, ...args })

  return [...controls, ...panels, ...buttons].sort((a, b) => a.order - b.order)
}
