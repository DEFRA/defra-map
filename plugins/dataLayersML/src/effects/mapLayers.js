import { parseColor } from '../../../../src/utils/parseColor.js'

/**
 * Ensures MapLibre sources and layers exist for a given layer config.
 * Shared sources are cached in `sourceCache` by URL.
 */
export const updateMapSources = (map, mapStyleId, layer, geojson, sourceCache) => {
  const layerId = layer.layerId || layer.id
  const urlKey = layer.url

  const sourceId = urlKey
    ? (sourceCache.get(urlKey) || `src-${btoa(urlKey).replace(/=+$/, '')}`)
    : `${layerId}-runtime-source`

  // --- Ensure source exists ---
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson || { type: 'FeatureCollection', features: [] }
    })
    if (urlKey) sourceCache.set(urlKey, sourceId)
  } else if (geojson) {
    map.getSource(sourceId).setData(geojson)
  }

  // --- Determine layer IDs based on presence of fill/stroke ---
  const hasFill = !!layer.fill
  const hasStroke = !!layer.stroke

  const fillLayerId = hasFill
    ? layerId // always main layer
    : null

  const strokeLayerId = hasStroke
    ? (hasFill ? `${layerId}-stroke` : layerId) // only add '-stroke' if both exist
    : null

  // --- Add fill layer ---
  if (hasFill && !map.getLayer(fillLayerId)) {
    const fillColor = parseColor(layer.fill, mapStyleId)
    map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': fillColor,
        'fill-opacity': layer.opacity || 1
      },
      ...(layer.filter ? { filter: layer.filter } : {})
    })
  }

  // --- Add stroke layer ---
  if (hasStroke && !map.getLayer(strokeLayerId)) {
    const strokeColor = parseColor(layer.stroke, mapStyleId)
    map.addLayer({
      id: strokeLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': strokeColor,
        'line-width': layer.strokeWidth || 1,
        'line-opacity': layer.opacity || 1,
        ...(layer.strokeDashArray ? { 'line-dasharray': layer.strokeDashArray } : {})
      },
      ...(layer.filter ? { filter: layer.filter } : {})
    })
  }

  return sourceId
}



