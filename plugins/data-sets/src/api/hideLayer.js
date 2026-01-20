export const hideLayer = ({ mapProvider, pluginState }, layerId) => {
  const map = mapProvider.map

  // Update map layer visibility
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', 'none')
  }
  if (map.getLayer(`${layerId}-stroke`)) {
    map.setLayoutProperty(`${layerId}-stroke`, 'visibility', 'none')
  }

  // Update state
  pluginState.dispatch({ type: 'SET_DATA_SET_VISIBILITY', payload: { id: layerId, visibility: 'hidden' } })
}