// src/hooks/usePanels.js
import { useEffect } from 'react'
import { EVENTS as events } from '../../config/events.js'
import eventBus from '../../services/eventBus.js'
import { addButton } from '../registry/buttonRegistry.js'
import { addPanel, removePanel } from '../registry/panelRegistry.js'
import { addControl } from '../registry/controlRegistry.js'
import { useApp } from '../store/appContext.js'

export const useInterfaceAPI = () => {
  const { dispatch, breakpoint } = useApp()

  useEffect(() => {
    const handleAddButton = ({ id, config }) => {
      addButton(id, config)
    }

    const handleAddPanel = ({ id, config }) => {
      const panel = addPanel(id, config)
      if (!panel[breakpoint]?.initiallyOpen) {
        return
      }
      dispatch({ type: 'OPEN_PANEL', payload: { panelId: id }})
    }

    const handleRemovePanel = (id) => {
      dispatch({ type: 'CLOSE_PANEL', payload: id })
      removePanel(id)
    }

    const handleShowPanel = (id) => {
      dispatch({ type: 'OPEN_PANEL', payload: { panelId: id }})
    }

    const handleHidePanel = (id) => {
      dispatch({ type: 'CLOSE_PANEL', payload: id })
    }

    const handleAddControl = ({ id, config }) => {
      addControl(id, config)
    }

    eventBus.on(events.APP_ADD_BUTTON, handleAddButton)
    eventBus.on(events.APP_ADD_PANEL, handleAddPanel)
    eventBus.on(events.APP_REMOVE_PANEL, handleRemovePanel)
    eventBus.on(events.APP_SHOW_PANEL, handleShowPanel)
    eventBus.on(events.APP_HIDE_PANEL, handleHidePanel)
    eventBus.on(events.APP_ADD_CONTROL, handleAddControl)

    return () => {
      eventBus.off(events.APP_ADD_BUTTON, handleAddButton)
      eventBus.off(events.APP_ADD_PANEL, handleAddPanel)
      eventBus.off(events.APP_REMOVE_PANEL, handleRemovePanel)
      eventBus.off(events.APP_SHOW_PANEL, handleShowPanel)
      eventBus.off(events.APP_HIDE_PANEL, handleHidePanel)
      eventBus.off(events.APP_ADD_CONTROL, handleAddControl)
    }
  }, [dispatch])
}
