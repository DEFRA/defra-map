// src/hooks/usePanels.js
import { useEffect } from 'react'
import eventBus from '../../services/eventBus.js'
import { addPanel, removePanel } from '../registry/panelRegistry.js'
import { useApp } from '../store/appContext.js'

export const usePanelsAPI = () => {
  const { dispatch } = useApp()

  useEffect(() => {
    const handleAddPanel = ({ id, config }) => {
      addPanel(id, config)
      dispatch({ type: 'OPEN_PANEL', payload: { panelId: id }})
    }

    const handleRemovePanel = (id) => {
      dispatch({ type: 'CLOSE_PANEL', payload: id })
      removePanel(id)
    }

    eventBus.on('app:addpanel', handleAddPanel)
    eventBus.on('app:removepanel', handleRemovePanel)

    return () => {
      eventBus.off('app:addpanel', handleAddPanel)
      eventBus.off('app:removepanel', handleRemovePanel)
    }
  }, [dispatch])
}
