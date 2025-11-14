import { useEffect, useContext } from 'react'
import { useApp } from '../store/appContext.js'
import { useMap } from '../store/mapContext.js'
import { PluginContext } from '../store/PluginProvider.jsx'
import { registeredPlugins } from '../registry/pluginRegistry.js'

export function useButtonStateEvaluator() {
  const appState = useApp()
  const mapState = useMap()
  const pluginContext = useContext(PluginContext)
  const { dispatch } = useApp()
  useEffect(() => {
    
    if (!appState || !mapState || !pluginContext) {
      return
    }

    registeredPlugins.forEach((plugin) => {
      const buttons = plugin?.manifest?.buttons || []
      const pluginState = pluginContext.state[plugin.id] || {}

      const combinedState = { appState, mapState, pluginState }

      buttons.forEach((btn) => {
        // Determine if the button should be disabled
        if (typeof btn.enableWhen === 'function') {
          try {
            const shouldBeEnabled = btn.enableWhen(combinedState)
            const isDisabled = !shouldBeEnabled
            const currentlyDisabled = appState.disabledButtons.has(btn.id)

            if (isDisabled !== currentlyDisabled) {
              dispatch({
                type: 'TOGGLE_BUTTON_DISABLED',
                payload: { id: btn.id, isDisabled }
              })
            }
          } catch (err) {
            console.warn(`enableWhen error for button ${btn.id}:`, err)
          }
        }

        // Determine if the button should be hidden
        if (typeof btn.hiddenWhen === 'function') {
          try {
            const shouldBeHidden = btn.hiddenWhen(combinedState)
            const currentlyHidden = appState.hiddenButtons.has(btn.id)

            if (shouldBeHidden !== currentlyHidden) {
              dispatch({
                type: 'TOGGLE_BUTTON_HIDDEN',
                payload: { id: btn.id, isHidden: shouldBeHidden }
              })
            }
          } catch (err) {
            console.warn(`hiddenWhen error for button ${btn.id}:`, err)
          }
        }

        // Determine if the button should be pressed
        if (typeof btn.pressedWhen === 'function') {
          try {
            const shouldBePressed = btn.pressedWhen(combinedState)
            const currentlyPressed = appState.pressedButtons.has(btn.id)

            if (shouldBePressed !== currentlyPressed) {
              dispatch({
                type: 'TOGGLE_BUTTON_PRESSED',
                payload: { id: btn.id, isPressed: shouldBePressed }
              })
            }
          } catch (err) {
            console.warn(`hiddenWhen error for button ${btn.id}:`, err)
          }
        }
      })
    })
  }, [appState, mapState, pluginContext])
}
