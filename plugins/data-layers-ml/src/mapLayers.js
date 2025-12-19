import { getValueForStyle } from '../../../src/utils/getValueForStyle.js'

export const addMapLayers = (map, mapStyleId, layer) => {
  const sourceId = `${layer.id}-source`
  
  // --- Add vector tile source ---
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'vector',
      tiles: layer.tiles,
      minzoom: layer.minZoom || 0,
      maxzoom: layer.maxZoom || 22
    })
  }

  // --- Determine layer IDs ---
  const hasFill = !!layer.fill
  const hasStroke = !!layer.stroke
  const fillLayerId = hasFill ? layer.id : null
  const strokeLayerId = hasStroke ? (hasFill ? `${layer.id}-stroke` : layer.id) : null

  // --- Add fill layer ---
  if (hasFill && !map.getLayer(fillLayerId)) {
    const fillColor = getValueForStyle(layer.fill, mapStyleId)
    map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      'source-layer': layer.sourceLayer,
      paint: {
        'fill-color': fillColor,
        'fill-opacity': layer.opacity || 1
      },
      ...(layer.filter ? { filter: layer.filter } : {})
    })
  }

  // --- Add stroke layer ---
  if (hasStroke && !map.getLayer(strokeLayerId)) {
    const strokeColor = getValueForStyle(layer.stroke, mapStyleId)
    map.addLayer({
      id: strokeLayerId,
      type: 'line',
      source: sourceId,
      'source-layer': layer.sourceLayer,
      paint: {
        'line-color': strokeColor,
        'line-width': layer.strokeWidth || 1,
        'line-opacity': layer.opacity || 1,
        ...(layer.strokeDashArray ? { 'line-dasharray': layer.strokeDashArray } : {})
      },
      ...(layer.filter ? { filter: layer.filter } : {})
    })
  }
}