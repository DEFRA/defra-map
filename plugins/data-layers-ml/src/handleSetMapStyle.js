import { addMapLayers } from './mapLayers.js'

export const handleSetMapStyle = ({
  map,
  eventBus,
  layers
}) => {
  const onSetStyle = (e) => {
    map.once('idle', () => {
      const newStyleId = e.id
      
      // Re-add all layers with correct colors for new style
      layers.forEach(layer => {
        addMapLayers(map, newStyleId, layer)
      })
    })
  }

  eventBus.on('map:setmapstyle', onSetStyle)
  return onSetStyle
}