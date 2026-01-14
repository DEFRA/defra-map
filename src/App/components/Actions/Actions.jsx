import React from 'react'
import { useApp } from '../../store/appContext'

export const Actions = ({ slot, children }) => {
  const { openPanels, panelConfig, breakpoint } = useApp()

  const childArray = React.Children.toArray(children)
  const visibleChild = childArray.find(c => c.props?.isHidden === false)

  // If a panel exists above we need so css adjustment
  const isBottomSlotUsed = Object.keys(openPanels).some(panelId => {
      return panelConfig[panelId]?.[breakpoint]?.slot === 'bottom'
  })

  const className = [
    'dm-c-panel',
    `dm-c-actions`,
    isBottomSlotUsed && 'dm-c-actions--border-top'
  ].filter(Boolean).join(' ')

  return (
    <div className={className} style={!visibleChild ? { display: 'none' } : undefined}>
      {children}
    </div>
  )
}
