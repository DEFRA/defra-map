import React from 'react'

export const Actions = ({ slot, children }) => {
  return (
    <div className={`am-c-${slot} am-c-panel`}>
      {children}
    </div>
  )
}
