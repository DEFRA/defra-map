import React from 'react'

export const MenuDataLayers = ({ services }) => {
  const { eventBus } = services

  const handleClick = (e) => {
    eventBus.emit('app:setmode', 'polygon')
  }

  return (
    <div className='am-c-menu-data-layers'>
      Data layers
      <div>
        <button onClick={handleClick}>Set draw mode</button>
      </div>
    </div>
  )
}
