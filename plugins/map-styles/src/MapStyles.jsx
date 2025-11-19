import React from 'react'
import { textSizeSvgPath } from './config.js'
import { scaleFactor } from '../../../src/config/appConfig.js'

export const MapStyles = ({ mapState, pluginConfig, services, mapProvider }) => {
  const { mapStyle: currentMapStyle, mapSize: currentMapSize } = mapState
  const { mapStyles } = pluginConfig
  const { eventBus } = services
  const { supportsMapSizes } = mapProvider.capabilities

  const handleMapStyleClick = (newMapStyle) => {
    eventBus.emit('map:setmapstyle', newMapStyle)
  }

  const handleMapSizeClick = (newMapSize) => {
    eventBus.emit('map:setmapsize', newMapSize)
    eventBus.emit('map:setpixelratio', window.devicePixelRatio * scaleFactor[newMapSize])
  }

  return (
    <div className='am-c-map-styles'>
      <div className='am-c-map-styles__group'>
        <div className='am-c-map-styles__inner'>
          {mapStyles.filter(mapStyle => mapStyle.url).map(mapStyle => (
            <div className='am-c-map-styles__item' key={mapStyle.id}>
              <button className='am-c-map-styles__button' aria-pressed={mapStyle.id === currentMapStyle.id} onClick={() => handleMapStyleClick(mapStyle)}>
                <div className='am-c-map-styles__image'>
                  <img src={mapStyle.thumbnail || undefined} height='60' width='60' />
                </div>
                {mapStyle.label}
              </button>
            </div>
          ))}
        </div>
      </div>
      {supportsMapSizes && (
        <div className='am-c-map-styles__group'>
          <h3 className='am-c-map-styles__heading' id='map-text-sizes'>Text size</h3>
          <div className='am-c-map-styles__inner'>
            {['small', 'medium', 'large'].map(size => (
              <div className='am-c-map-styles__item' key={size}>
                <button className='am-c-map-styles__button' onClick={() => handleMapSizeClick(size)} aria-pressed={size === currentMapSize}>
                  <div className='am-c-map-styles__image'>
                    <svg width='60' height='60' viewBox='0 0 60 60' fillRule='evenodd'>
                      <rect className='am-c-map-styles__image-bg' width='100%' height='100%' />
                      <g style={{ transform: `scale(${scaleFactor[size]})`, transformOrigin: '8px 52px' }}>
                        <path d={textSizeSvgPath} />
                      </g>
                    </svg>
                  </div>
                  {size[0].toUpperCase() + size.slice(1)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
