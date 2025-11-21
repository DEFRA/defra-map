// /plugins/use-location/UseLocation.jsx
import React from 'react'

export const UseLocation = ({ pluginState }) => {
  const { errorMessage } = pluginState

  return (
    <div className="dm-c-use-location">
      <p>{errorMessage}</p>
    </div>
  )
}
