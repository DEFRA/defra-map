// src/core/registry/keyboardShortcutRegistry.js
import { coreShortcuts } from '../controls/keyboardShortcuts.js'

// Stores the actual shortcut objects in insertion order
const pluginShortcutHelp = []

// Tracks only IDs for O(1) duplicate detection
const pluginShortcutIds = new Set()

let providerSupportedIds = new Set()

export const registerKeyboardShortcut = ({ shortcut }) => {
  // Only add if we haven't seen this ID before
  if (!pluginShortcutIds.has(shortcut.id)) {
    pluginShortcutIds.add(shortcut.id)
    pluginShortcutHelp.push(shortcut)
  }
}

export const setProviderSupportedShortcuts = (ids = []) => {
  providerSupportedIds = new Set(ids)
}

export const getKeyboardShortcuts = () => {
  const filteredCore = coreShortcuts.filter(s => providerSupportedIds.has(s.id))

  return [
    ...filteredCore, // supported core shortcuts
    ...pluginShortcutHelp // plugin-defined shortcuts (deduped)
  ]
}

