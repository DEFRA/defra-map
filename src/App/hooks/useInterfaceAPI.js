// src/hooks/usePanels.js
import { useEffect } from 'react'
import eventBus from '../../services/eventBus.js'
import { addButton } from '../registry/buttonRegistry.js'
import { addPanel, removePanel, getPanelConfig } from '../registry/panelRegistry.js'
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
      dispatch({ type: 'OPEN_PANEL', payload: { panelId: id, props: {
        isExclusive: panel[breakpoint]?.isExclusive }
      }})
    }

    const handleRemovePanel = (id) => {
      dispatch({ type: 'CLOSE_PANEL', payload: id })
      removePanel(id)
    }

    const handleShowPanel = (id) => {
      const panelConfig = getPanelConfig()
      const bpConfig = panelConfig[id][breakpoint]
      dispatch({ type: 'OPEN_PANEL', payload: { panelId: id, props: {
        isExclusive: bpConfig.isExclusive
      }}})
    }

    const handleHidePanel = (id) => {
      dispatch({ type: 'CLOSE_PANEL', payload: id })
    }

    const handleAddControl = ({ id, config }) => {
      addControl(id, config)
    }

    eventBus.on('app:addbutton', handleAddButton)
    eventBus.on('app:addpanel', handleAddPanel)
    eventBus.on('app:removepanel', handleRemovePanel)
    eventBus.on('app:showpanel', handleShowPanel)
    eventBus.on('app:hidepanel', handleHidePanel)
    eventBus.on('app:addcontrol', handleAddControl)

    return () => {
      eventBus.off('app:addbutton', handleAddButton)
      eventBus.off('app:addpanel', handleAddPanel)
      eventBus.off('app:removepanel', handleRemovePanel)
      eventBus.off('app:showpanel', handleShowPanel)
      eventBus.off('app:hidepanel', handleHidePanel)
      eventBus.off('app:addcontrol', handleAddControl)
    }
  }, [dispatch])
}
