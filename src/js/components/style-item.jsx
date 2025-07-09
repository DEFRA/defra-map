import React from 'react'
import { getImagePos } from '../lib/utils.js'
import image from '../lib/style-image.json'
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

const StyleItem = ({ key, item, currentStyleName, ref }) => {
  const viewportDispatch = useViewport().dispatch
  const handleStyleClick = e => {
    viewportDispatch({ type: 'SET_STYLE', payload: { style: e.currentTarget.value } })
  }

  const displayName = getStyleItemDisplayName(item)

  return (
    <div key={key} className='fm-c-layers__item govuk-body-s'>
      <button className='fm-c-layers__button' value={item.name} aria-pressed={currentStyleName === item.name} ref={ref} onClick={handleStyleClick}>
        <div className='fm-c-layers__image'>
          <img src={image.src} draggable={false} width='120px' height='120px' alt='' style={{ objectPosition: getImagePos(item.name) }} />
        </div>
        {displayName}
      </button>
    </div>
  )
}

export { StyleItem }
