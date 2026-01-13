// src/core/hooks/useButtonStateEvaluator.js
import { useEffect, useContext } from 'react'
import { useApp } from '../store/appContext.js'
import { useConfig } from '../store/configContext.js'
import { PluginContext } from '../store/PluginProvider.jsx'

export function useButtonStateEvaluator (evaluateProp) {
  const appState = useApp()
  const { pluginRegistry } = useConfig()
  const pluginContext = useContext(PluginContext)

  useEffect(() => {
    if (!appState?.dispatch || !pluginContext) {
      return
    }
    const { dispatch } = appState

    pluginRegistry.registeredPlugins.forEach((plugin) => {
      const buttons = plugin?.manifest?.buttons || []

      buttons.forEach((btn) => {
        const pluginId = plugin.id

        // EnableWhen
        if (typeof btn.enableWhen === 'function') {
          try {
            const shouldBeEnabled = evaluateProp(btn.enableWhen, pluginId)
            const currentlyDisabled = appState.disabledButtons.has(btn.id)
            const isDisabled = !shouldBeEnabled
            if (currentlyDisabled !== isDisabled) {
              dispatch({ type: 'TOGGLE_BUTTON_DISABLED', payload: { id: btn.id, isDisabled } })
            }
          } catch (err) {
            console.warn(`enableWhen error for button ${btn.id}:`, err)
          }
        }

        // HiddenWhen
        if (typeof btn.hiddenWhen === 'function') {
          try {
            const shouldBeHidden = evaluateProp(btn.hiddenWhen, pluginId)
            const currentlyHidden = appState.hiddenButtons.has(btn.id)
            if (currentlyHidden !== shouldBeHidden) {
              dispatch({ type: 'TOGGLE_BUTTON_HIDDEN', payload: { id: btn.id, isHidden: shouldBeHidden } })
            }
          } catch (err) {
            console.warn(`hiddenWhen error for button ${btn.id}:`, err)
          }
        }

        // PressedWhen
        if (typeof btn.pressedWhen === 'function') {
          try {
            const shouldBePressed = evaluateProp(btn.pressedWhen, pluginId)
            const currentlyPressed = appState.pressedButtons.has(btn.id)
            if (currentlyPressed !== shouldBePressed) {
              dispatch({ type: 'TOGGLE_BUTTON_PRESSED', payload: { id: btn.id, isPressed: shouldBePressed } })
            }
          } catch (err) {
            console.warn(`pressedWhen error for button ${btn.id}:`, err)
          }
        }
      })
    })
  }, [appState, pluginContext, evaluateProp])
}
