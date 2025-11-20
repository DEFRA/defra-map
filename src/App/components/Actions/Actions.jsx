import React from 'react'

export const Actions = ({ slot, children }) => {
  return (
    <div className={`dm-c-${slot} dm-c-panel`}>
      {children}
    </div>
  )
}
