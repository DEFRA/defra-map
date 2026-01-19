import { getValueForStyle } from '../../../src/utils/getValueForStyle.js'

export const addMapLayers = (map, mapStyleId, dataSet) => {
  const sourceId = `${dataSet.id}-source`
  
  // --- Add vector tile source ---
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'vector',
      tiles: dataSet.tiles,
      minzoom: dataSet.minZoom || 0,
      maxzoom: dataSet.maxZoom || 22
    })
  }

  // --- Determine layer IDs ---
  const hasFill = !!dataSet.fill
  const hasStroke = !!dataSet.stroke
  const fillLayerId = hasFill ? dataSet.id : null
  const strokeLayerId = hasStroke ? (hasFill ? `${dataSet.id}-stroke` : dataSet.id) : null
  
  // --- Determie visiblity ---
  const visibility = dataSet.visibility === 'hidden' ? 'none' : 'visible'

  // --- Add fill layer ---
  if (hasFill && !map.getLayer(fillLayerId)) {
    const fillColor = getValueForStyle(dataSet.fill, mapStyleId)
    map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      'source-layer': dataSet.sourceLayer,
      layout: {
        visibility
      },
      paint: {
        'fill-color': fillColor,
        'fill-opacity': dataSet.opacity || 1
      },
      ...(dataSet.filter ? { filter: dataSet.filter } : {})
    })
  }

  // --- Add stroke layer ---
  if (hasStroke && !map.getLayer(strokeLayerId)) {
    const strokeColor = getValueForStyle(dataSet.stroke, mapStyleId)
    map.addLayer({
      id: strokeLayerId,
      type: 'line',
      source: sourceId,
      'source-layer': dataSet.sourceLayer,
      layout: {
        visibility
      },
      paint: {
        'line-color': strokeColor,
        'line-width': dataSet.strokeWidth || 1,
        'line-opacity': dataSet.opacity || 1,
        ...(dataSet.strokeDashArray ? { 'line-dasharray': dataSet.strokeDashArray } : {})
      },
      ...(dataSet.filter ? { filter: dataSet.filter } : {})
    })
  }
}