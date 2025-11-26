// src/core/renderers/mapControls.js
import React from 'react'
import { getControlConfig } from '../registry/controlRegistry.js'
import { registeredPlugins } from '../registry/pluginRegistry.js'
import { withPluginContexts } from './pluginWrapper.js'
import { allowedSlots } from './slots.js'

/**
 * Map controls for a given slot and app state.
 * Pure utility: returns an array of control descriptors.
 */
export function mapControls({ slot, appState }) {
  const { breakpoint, mode } = appState
  const controlConfig = getControlConfig()

  return Object.values(controlConfig)
    .filter(control => {
      const bpConfig = control[breakpoint]
      if (!bpConfig) {
        return false
      }

      const slotAllowed = allowedSlots.control.includes(bpConfig.slot)
      const inModeWhitelist = control.includeModes?.includes(mode) ?? true
      const inExcludeModes = control.excludeModes?.includes(mode) ?? false

      // Only include controls allowed in slot and current mode
      return inModeWhitelist && !inExcludeModes && bpConfig.slot === slot && slotAllowed
    })
    .map(control => {
      const plugin = registeredPlugins.find(p =>
        p.manifest?.controls?.some(c => c.id === control.id)
      )

      const Wrapped = withPluginContexts(control.render, {
        pluginId: plugin?.id,
        pluginConfig: plugin?.config
      })

      return {
        id: control.id,
        type: 'control',
        order: control[breakpoint]?.order ?? 0,
        element: <Wrapped key={control.id} />
      }
    })
}
