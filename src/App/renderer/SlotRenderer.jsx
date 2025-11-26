// src/core/renderers/SlotRenderer.jsx
import React from 'react'
import { useConfig } from '../store/configContext'
import { useApp } from '../store/appContext'
import { getSlotItems } from './slotAggregator'
import { Actions } from '../components/Actions/Actions'

export const SlotRenderer = ({ slot }) => {
  const appConfig = useConfig()
  const appState = useApp()

  const slotItems = getSlotItems({ slot, appState, appConfig })

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