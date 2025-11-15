import { useEffect, useContext } from 'react'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { PluginContext } from '../store/PluginProvider.jsx'
import { registeredPlugins } from '../registry/pluginRegistry.js'

const evaluateButton = (btn, combinedState, currentState, dispatch) => {
  // Evaluate enableWhen
  if (typeof btn.enableWhen === 'function') {
    try {
      const shouldBeEnabled = btn.enableWhen(combinedState)
      const isDisabled = !shouldBeEnabled
      const currentlyDisabled = currentState.disabledButtons.has(btn.id)

      if (isDisabled !== currentlyDisabled) {
        dispatch({ type: 'TOGGLE_BUTTON_DISABLED', payload: { id: btn.id, isDisabled } })
      }
    } catch (err) {
      console.warn(`enableWhen error for button ${btn.id}:`, err)
    }
  }

  // Evaluate hiddenWhen
  if (typeof btn.hiddenWhen === 'function') {
    try {
      const shouldBeHidden = btn.hiddenWhen(combinedState)
      const currentlyHidden = currentState.hiddenButtons.has(btn.id)

      if (shouldBeHidden !== currentlyHidden) {
        dispatch({ type: 'TOGGLE_BUTTON_HIDDEN', payload: { id: btn.id, isHidden: shouldBeHidden } })
      }
    } catch (err) {
      console.warn(`hiddenWhen error for button ${btn.id}:`, err)
    }
  }

  // Evaluate pressedWhen
  if (typeof btn.pressedWhen === 'function') {
    try {
      const shouldBePressed = btn.pressedWhen(combinedState)
      const currentlyPressed = currentState.pressedButtons.has(btn.id)

      if (shouldBePressed !== currentlyPressed) {
        dispatch({ type: 'TOGGLE_BUTTON_PRESSED', payload: { id: btn.id, isPressed: shouldBePressed } })
      }
    } catch (err) {
      console.warn(`pressedWhen error for button ${btn.id}:`, err)
    }
  }
}

export function useButtonStateEvaluator() {
  const appState = useApp()
  const mapState = useMap()
  const pluginContext = useContext(PluginContext)

  useEffect(() => {
    if (!appState?.dispatch || !mapState || !pluginContext) {
      return
    }

    const { dispatch } = appState

    registeredPlugins.forEach((plugin) => {
      const buttons = plugin?.manifest?.buttons || []
      const pluginState = pluginContext.state[plugin.id] || {}
      const combinedState = { appState, mapState, pluginState }

      buttons.forEach((btn) => evaluateButton(btn, combinedState, appState, dispatch))
    })
  }, [appState, mapState, pluginContext])
}