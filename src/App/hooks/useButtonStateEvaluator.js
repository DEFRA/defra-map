import { useEffect, useContext } from 'react'
import { useConfig } from '../store/configContext.js'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { PluginContext } from '../store/PluginProvider.jsx'
import { registeredPlugins } from '../registry/pluginRegistry.js'

const evaluateButton = (btn, appConfig, appState, mapState, pluginState, dispatch) => {
  const { disabledButtons, hiddenButtons, pressedButtons } = appState

  // Evaluate enableWhen
  if (typeof btn.enableWhen === 'function') {
    try {
      const shouldBeEnabled = btn.enableWhen({ appConfig, appState, mapState, pluginState })
      const isDisabled = !shouldBeEnabled
      const currentlyDisabled = disabledButtons.has(btn.id)

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
      const shouldBeHidden = btn.hiddenWhen({ appConfig, appState, mapState, pluginState })
      const currentlyHidden = hiddenButtons.has(btn.id)

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
      const shouldBePressed = btn.pressedWhen({ appConfig, appState, mapState, pluginState })
      const currentlyPressed = pressedButtons.has(btn.id)

      if (shouldBePressed !== currentlyPressed) {
        dispatch({ type: 'TOGGLE_BUTTON_PRESSED', payload: { id: btn.id, isPressed: shouldBePressed } })
      }
    } catch (err) {
      console.warn(`pressedWhen error for button ${btn.id}:`, err)
    }
  }
}

export function useButtonStateEvaluator() {
  const appConfig = useConfig()
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
      buttons.forEach((btn) => evaluateButton(btn, appConfig, appState, mapState, pluginState, dispatch))
    })
  }, [appConfig, appState, mapState, pluginContext])
}