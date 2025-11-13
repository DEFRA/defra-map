// src/core/registry/keyboardShortcutRegistry.js
import { coreShortcuts } from '../controls/keyboardShortcuts.js'

const pluginShortcutHelp = []
let providerSupportedIds = new Set()

export const registerKeyboardShortcut = ({ shortcut }) => {
  pluginShortcutHelp.push(shortcut)
}

export const setProviderSupportedShortcuts = (ids = []) => {
  providerSupportedIds = new Set(ids)
}

export const getKeyboardShortcuts = () => {
  const filteredCore = coreShortcuts.filter(s => providerSupportedIds.has(s.id))
  return [
    ...filteredCore, // core-defined help entries that are supported by provider
    ...pluginShortcutHelp // plugin-defined help entries
  ]
}
