import React, { useMemo } from 'react'
import { getButtonConfig } from '../registry/buttonRegistry.js'
import { MapButton } from '../components/MapButton/MapButton.jsx'
import { allowedSlots } from './slots.js'

/**
 * Pure function to parse and group buttons
 */
function getButtonGroups ({ buttonConfig, slot, breakpoint, mode }) {
  if (!buttonConfig) {
    return []
  }

  // Filter buttons
  const matchingButtons = Object.entries(buttonConfig).filter(([_, config]) => {
    const bpconfig = config[breakpoint]
    const inModeWhitelist = config.includeModes?.includes(mode) ?? true
    const inExcludeModes = config.excludeModes?.includes(mode) ?? false
    
    return inModeWhitelist &&
      !inExcludeModes &&
      bpconfig?.slot === slot &&
      allowedSlots.button.includes(bpconfig.slot)
  })

  if (!matchingButtons.length) {
    return []
  }

  // Group adjacent buttons by config.group
  const groups = []
  let currentGroup = null
  matchingButtons.forEach(([id, config]) => {
    const groupKey = config.group || null
    if (!currentGroup || currentGroup.groupKey !== groupKey) {
      currentGroup = { groupKey, buttons: [[id, config]] }
      groups.push(currentGroup)
    } else {
      currentGroup.buttons.push([id, config])
    }
  })

  return groups
}

/**
 * Render a single MapButton
 */
function renderButton ([buttonId, config], breakpoint, openPanels, dispatch, disabledButtons, hiddenButtons, pressedButtons, idPrefix) {
  const bpconfig = config[breakpoint]
  const isOpen = config.panelId ? openPanels[config.panelId] : false

  const handleClick = () => {
    if (typeof config.onClick === 'function') {
      return config.onClick()
    }
    if (!config.panelId) {
      return
    }
    const triggeringElement = document.activeElement
    if (!isOpen) {
      dispatch({ type: 'OPEN_PANEL', payload: { panelId: config.panelId, props: { triggeringElement }}})
    } else {
      dispatch({ type: 'CLOSE_PANEL', payload: config.panelId })
    }
  }

  return (
    <MapButton
      key={buttonId}
      buttonId={buttonId}
      iconId={config.iconId}
      variant={config.variant}
      label={config.label}
      showLabel={bpconfig.showLabel}
      isDisabled={disabledButtons.has(buttonId)}
      isHidden={hiddenButtons.has(buttonId)}
      isPressed={config.pressedWhen ? pressedButtons.has(buttonId) : undefined}
      isOpen={isOpen}
      onClick={handleClick}
      panelId={config.panelId}
      idPrefix={idPrefix}
    />
  )
}

/**
 * React hook wrapper using useMemo
 */
function mapButtons ({ slot, breakpoint, mode, openPanels, dispatch, disabledButtons, hiddenButtons, pressedButtons, id }) {
  const buttonConfig = getButtonConfig()

  return useMemo(() => {
    const groups = getButtonGroups({ buttonConfig, slot, breakpoint, mode, openPanels })
    if (!groups.length) {
      return []
    }

    return groups.map(group => {
      if (group.buttons.length > 1) {
        const groupId = group.groupKey || group.buttons[0][0]
        return {
          id: `group-${groupId}`,
          type: 'group',
          order: Math.min(...group.buttons.map(([_, config]) => config[breakpoint]?.order ?? 0)),
          element: (
            <div key={`group-${groupId}`} className='dm-c-button-group'>
              {group.buttons.map(btn => renderButton(btn, breakpoint, openPanels, dispatch, disabledButtons, hiddenButtons, pressedButtons, id))}
            </div>
          )
        }
      }

      const [buttonId, config] = group.buttons[0]
      return {
        id: buttonId,
        type: 'button',
        order: config[breakpoint]?.order ?? 0,
        element: renderButton(group.buttons[0], breakpoint, openPanels, dispatch, disabledButtons, hiddenButtons, pressedButtons, id)
      }
    })
  }, [buttonConfig, slot, breakpoint, mode, openPanels, dispatch, disabledButtons, hiddenButtons, pressedButtons, id])
}

export {
  getButtonGroups, // Exported for testing
  renderButton, // Exported for testing
  mapButtons
}
