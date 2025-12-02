// src/hooks/usePanels.js
import { useEffect } from 'react'
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
      dispatch({ type: 'OPEN_PANEL', payload: { panelId: id } })
    }

    const handleAddControl = ({ id, config }) => {
      addControl(id, config)
    }

    const handleRemovePanel = (id) => {
      dispatch({ type: 'CLOSE_PANEL', payload: id })
      removePanel(id)
    }

    eventBus.on('app:addbutton', handleAddButton)
    eventBus.on('app:addpanel', handleAddPanel)
    eventBus.on('app:addcontrol', handleAddControl)
    eventBus.on('app:removepanel', handleRemovePanel)

    return () => {
      eventBus.off('app:addbutton', handleAddButton)
      eventBus.off('app:addpanel', handleAddPanel)
      eventBus.off('app:addcontrol', handleAddControl)
      eventBus.off('app:removepanel', handleRemovePanel)
    }
  }, [dispatch])
}
