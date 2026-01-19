import { addMapLayers } from './mapLayers.js'

export const handleSetMapStyle = ({
  map,
  events,
  eventBus,
  getDataSets
}) => {
  const onSetStyle = (e) => {
    map.once('idle', () => {
      const newStyleId = e.id

      // Re-add all layers with correct colors for new style
      getDataSets().forEach(dataSet => {
        addMapLayers(map, newStyleId, dataSet)
      })
    })
  }

  eventBus.on(events.MAP_SET_STYLE, onSetStyle)
  return onSetStyle
}