import React from 'react'

export const MenuDataLayers = ({ services }) => {
  const { events, eventBus } = services

  const handleClick = (e) => {
    eventBus.emit(events.APP_SET_MODE, 'polygon')
  }

  return (
    <div className='dm-c-menu-data-layers'>
      Data layers
      <div>
        <button onClick={handleClick}>Set draw mode</button>
      </div>
    </div>
  )
}
