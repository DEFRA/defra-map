export const showDataset = ({ mapProvider, pluginState }, layerId) => {
  const map = mapProvider.map

  // Update map layer visibility
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', 'visible')
  }
  if (map.getLayer(`${layerId}-stroke`)) {
    map.setLayoutProperty(`${layerId}-stroke`, 'visibility', 'visible')
  }

  // Update state
  pluginState.dispatch({ type: 'SET_DATASET_VISIBILITY', payload: { id: layerId, visibility: 'visible' } })
}