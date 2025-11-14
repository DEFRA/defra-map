// src/core/renderers/SlotRenderer.jsx
import React from 'react'
import { useApp } from '../store/appContext'
import { useConfig } from '../store/configContext'
import { getSlotItems } from './slotAggregator'
import { Actions } from '../components/Actions/Actions'

export const SlotRenderer = ({ slot }) => {
  const { id } = useConfig()
  const { breakpoint, mode, openPanels, dispatch, disabledButtons, hiddenButtons, interfaceType } = useApp()

  const slotItems = getSlotItems({
    id, slot, breakpoint, mode, openPanels, dispatch, disabledButtons, hiddenButtons
  })

  if (!slotItems.length) {
    return null
  }

  return (
    <>
      {slot === 'actions' ? (
        <Actions slot={slot}>
          {slotItems.map(item => item.element)}
        </Actions>
      ) : <>{slotItems.map(item => item.element)}</>}
    </>
  )
}