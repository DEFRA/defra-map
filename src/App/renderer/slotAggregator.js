// src/core/renderers/slotAggregator.js
import { mapControls } from './mapControls.js'
import { mapPanels } from './mapPanels.js'
import { mapButtons } from './mapButtons.js'

export function getSlotItems ({ evaluateProp, ...args }) {
  const controls = mapControls({ evaluateProp, ...args })
  const panels = mapPanels({ evaluateProp, ...args })
  const buttons = mapButtons({ evaluateProp, ...args })

  const items = [...controls, ...panels, ...buttons]

  // Start with items that have no explicit order (in their natural sequence)
  const withoutOrder = items.filter(item => item.order == null || item.order === 0)
  const withOrder = items.filter(item => item.order != null && item.order !== 0)

  // Sort items with order by their order value (stable sort preserves ties)
  withOrder.sort((a, b) => a.order - b.order)

  // Insert each ordered item at its specified position
  const result = [...withoutOrder]
  for (const item of withOrder) {
    // Clamp position to valid range (1-based, so subtract 1 for array index)
    const pos = Math.min(Math.max(item.order - 1, 0), result.length)
    result.splice(pos, 0, item)
  }

  return result
}
