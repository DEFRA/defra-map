import { addMapLayers } from './mapLayers.js'

export const handleSetMapStyle = ({
  map,
  events,
  eventBus,
  getDatasets
}) => {
  const onSetStyle = (e) => {
    map.once('idle', () => {
      const newStyleId = e.id

      // Re-add all layers with correct colors for new style
      getDatasets().forEach(dataset => {
        addMapLayers(map, newStyleId, dataset)
      })
    })
  }

  eventBus.on(events.MAP_SET_STYLE, onSetStyle)
  return onSetStyle
}