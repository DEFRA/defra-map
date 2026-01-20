import { getValueForStyle } from '../../../src/utils/getValueForStyle.js'

export const addMapLayers = (map, mapStyleId, dataset) => {
  const sourceId = `${dataset.id}-source`
  
  // --- Add vector tile source ---
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'vector',
      tiles: dataset.tiles,
      minzoom: dataset.minZoom || 0,
      maxzoom: dataset.maxZoom || 22
    })
  }

  // --- Determine layer IDs ---
  const hasFill = !!dataset.fill
  const hasStroke = !!dataset.stroke
  const fillLayerId = hasFill ? dataset.id : null
  const strokeLayerId = hasStroke ? (hasFill ? `${dataset.id}-stroke` : dataset.id) : null
  
  // --- Determie visiblity ---
  const visibility = dataset.visibility === 'hidden' ? 'none' : 'visible'

  // --- Add fill layer ---
  if (hasFill && !map.getLayer(fillLayerId)) {
    const fillColor = getValueForStyle(dataset.fill, mapStyleId)
    map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      'source-layer': dataset.sourceLayer,
      layout: {
        visibility
      },
      paint: {
        'fill-color': fillColor,
        'fill-opacity': dataset.opacity || 1
      },
      ...(dataset.filter ? { filter: dataset.filter } : {})
    })
  }

  // --- Add stroke layer ---
  if (hasStroke && !map.getLayer(strokeLayerId)) {
    const strokeColor = getValueForStyle(dataset.stroke, mapStyleId)
    map.addLayer({
      id: strokeLayerId,
      type: 'line',
      source: sourceId,
      'source-layer': dataset.sourceLayer,
      layout: {
        visibility
      },
      paint: {
        'line-color': strokeColor,
        'line-width': dataset.strokeWidth || 1,
        'line-opacity': dataset.opacity || 1,
        ...(dataset.strokeDashArray ? { 'line-dasharray': dataset.strokeDashArray } : {})
      },
      ...(dataset.filter ? { filter: dataset.filter } : {})
    })
  }
}