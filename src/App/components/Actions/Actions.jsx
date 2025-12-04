import React from 'react'

export const Actions = ({ slot, children }) => {
  const childArray = React.Children.toArray(children)
  const visibleChild = childArray.find(c => !c.props?.isHidden)

  return (
    <div className={`dm-c-${slot} dm-c-panel`} style={!visibleChild ? { display: 'none' } : undefined}>
      {children}
    </div>
  )
}
