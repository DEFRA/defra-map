import React from 'react'
import { useViewport } from '../store/use-viewport'

const getStyleItemDisplayName = (item) => {
  if (item.displayName) {
    return item.displayName
  }
  return {
    default: 'Default',
    dark: 'Dark',
    aerial: 'Aerial',
    deuteranopia: 'Green-red enhanced',
    tritanopia: 'Blue-yellow enhanced'
  }[item.name] || item.name
}

const StyleItem = ({ item, currentStyleName }) => {
  const viewportDispatch = useViewport().dispatch
  const handleStyleClick = e => {
    viewportDispatch({ type: 'SET_STYLE', payload: { style: e.currentTarget.value } })
  }

  const displayName = getStyleItemDisplayName(item)

  return (
    <div className='fm-c-layers__item govuk-body-s'>
      <button className='fm-c-layers__button' value={item.name} aria-pressed={currentStyleName === item.name} onClick={handleStyleClick}>
        <div className='fm-c-layers__image'>
          <img src={item.iconUrl} draggable={false} width='120px' height='120px' alt='' />
        </div>
        {displayName}
      </button>
    </div>
  )
}

export { StyleItem }
