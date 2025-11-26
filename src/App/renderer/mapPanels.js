// src/core/renderers/mapPanels.js
import React from 'react'
import { stringToKebab } from '../../utils/stringToKebab.js'
import { getPanelConfig } from '../registry/panelRegistry.js'
import { registeredPlugins } from '../registry/pluginRegistry.js'
import { withPluginContexts } from './pluginWrapper.js'
import { Panel } from '../components/Panel/Panel.jsx'
import { allowedSlots } from './slots.js'

export function mapPanels ({ slot, appState }) {
  const { breakpoint, mode, openPanels } = appState
  const panelConfig = getPanelConfig()

  // Get currently open modal panels
  const openPanelEntries = Object.entries(openPanels)
  const modalPanels = openPanelEntries.filter(([panelId]) => {
    const config = panelConfig[panelId]
    return config?.[breakpoint]?.modal
  })

  // Only allow the last opened modal panel
  const allowedModalPanelId = modalPanels.length > 0
    ? modalPanels[modalPanels.length - 1][0]
    : null

  return openPanelEntries
    .map(([panelId, { props }]) => {
      const config = panelConfig[panelId]
      if (!config) {
        return null
      }

      const bpConfig = config[breakpoint]
      if (!bpConfig) {
        return null
      }

      const targetSlot = bpConfig.modal ? 'modal' : bpConfig.slot
      const isNextToButton = `${stringToKebab(panelId)}-button` === targetSlot
      const slotAllowed = allowedSlots.panel.includes(targetSlot) || isNextToButton
      const inModeWhitelist = config.includeModes?.includes(mode) ?? true
      const inExcludeModes = config.excludeModes?.includes(mode) ?? false

      // Skip if not allowed in current slot/mode or modal rules
      if (!slotAllowed || !inModeWhitelist || inExcludeModes) {
        return null
      }
      if (targetSlot !== slot) {
        return null
      }
      if (bpConfig.modal && panelId !== allowedModalPanelId) {
        return null
      }

      const plugin = registeredPlugins.find(p => p.id === config.pluginId)
      const WrappedChild = config.render
        ? withPluginContexts(config.render, {
          ...props,
          pluginId: plugin?.id, // Default panels don't need an id
          pluginConfig: plugin?.config
        })
        : null

      return {
        id: panelId,
        type: 'panel',
        order: bpConfig.order ?? 0,
        element: <Panel key={panelId} panelId={panelId} panelConfig={config} props={props} WrappedChild={WrappedChild} />
      }
    })
    .filter(Boolean)
}
