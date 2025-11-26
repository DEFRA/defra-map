// src/core/renderers/mapButtons.js
import { MapButton } from '../components/MapButton/MapButton.jsx'
import { getButtonConfig } from '../registry/buttonRegistry.js'
import { allowedSlots } from './slots.js'

/**
 * Return a flat list of matching [id, config] pairs
 */
function getMatchingButtons({ appState, appConfig, buttonConfig, slot }) {
  const { breakpoint, mode } = appState

  if (!buttonConfig) {
    return []
  }

  return Object.entries(buttonConfig).filter(([_, config]) => {
    const bp = config[breakpoint]

    // Exclude completely
    if (typeof config.excludeWhen === 'function' && config.excludeWhen({ appConfig, appState })) {
      return false
    }

    // Mode filtering
    if (config.includeModes && !config.includeModes.includes(mode)) {
      return false
    }
    if (config.excludeModes && config.excludeModes.includes(mode)) {
      return false
    }

    // Slot matching
    if (bp?.slot !== slot || !allowedSlots.button.includes(bp.slot)) {
      return false
    }

    return true
  })
}

/**
 * Create a consistent onClick handler for a button
 */
function createButtonClickHandler(btn, appState, appConfig) {
  const [_, config] = btn
  const isOpen = !!(config.panelId && appState.openPanels[config.panelId])

  return (event) => {
    // Call original manifest onClick if defined
    if (typeof config.onClick === 'function') {
      return config.onClick(event, { appState, appConfig })
    }

    // Panel control
    if (config.panelId) {
      const triggeringElement = document.activeElement
      appState.dispatch({
        type: isOpen ? 'CLOSE_PANEL' : 'OPEN_PANEL',
        payload: isOpen
          ? config.panelId
          : { panelId: config.panelId, props: { triggeringElement } }
      })
    }
  }
}

/**
 * Render a MapButton wrapper
 */
function renderButton({ btn, appState, appConfig, groupStart, groupMiddle, groupEnd }) {
  const [buttonId, config] = btn
  const bp = config[appState.breakpoint] ?? {}

  // Evaluate dynamic label if function
  const label = typeof config.label === 'function'
    ? config.label({ appState, appConfig })
    : config.label

  // Evaluate dynamic href if function
  const iconId = typeof config.iconId === 'function'
    ? config.iconId({ appState, appConfig })
    : config.iconId

  // Evaluate dynamic href if function
  const href = typeof config.href === 'function'
    ? config.href({ appState, appConfig })
    : config.href

  const handleClick = createButtonClickHandler(btn, appState, appConfig)
  const isOpen = !!(config.panelId && appState.openPanels[config.panelId])

  return (
    <MapButton
      key={buttonId}
      buttonId={buttonId}
      iconId={iconId}
      variant={config.variant}
      label={label}
      href={href}
      showLabel={bp.showLabel}
      isDisabled={appState.disabledButtons.has(buttonId)}
      isHidden={appState.hiddenButtons.has(buttonId)}
      isPressed={config.pressedWhen ? appState.pressedButtons.has(buttonId) : undefined}
      isOpen={isOpen}
      onClick={handleClick}
      panelId={config.panelId}
      idPrefix={appConfig.id}
      groupStart={groupStart}
      groupMiddle={groupMiddle}
      groupEnd={groupEnd}
    />
  )
}

/**
 * Main function: generate flat list of buttons with dynamic props and group flags
 */
function mapButtons({ slot, appState, appConfig }) {
  const buttonConfig = getButtonConfig()
  const breakpoint = appState.breakpoint
  const matching = getMatchingButtons({ appState, appConfig, buttonConfig, slot })

  if (!matching.length) {
    return []
  }

  // Build group map: groupKey -> indices
  const groupMap = new Map()
  matching.forEach(([, config], idx) => {
    const key = config.group
    if (key == null) return
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key).push(idx)
  })

  // Remove singletons
  for (const [key, indices] of groupMap) {
    if (indices.length < 2) groupMap.delete(key)
  }

  // Build flat list with group flags
  return matching.map((btn, idx) => {
    const [buttonId, config] = btn
    const key = config.group
    const indices = key != null ? groupMap.get(key) : null

    const groupStart = indices ? idx === indices[0] : false
    const groupEnd = indices ? idx === indices[indices.length - 1] : false
    const groupMiddle = indices && indices.length >= 3 && !groupStart && !groupEnd

    const order = config[breakpoint]?.order ?? 0

    return {
      id: buttonId,
      type: 'button',
      order,
      element: renderButton({ btn, appState, appConfig, groupStart, groupMiddle, groupEnd })
    }
  })
}

export {
  mapButtons,
  getMatchingButtons,
  renderButton
}
