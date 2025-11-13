import { spatialNavigate } from './spatial.js'
import { calculateLinearTextSize } from './calculateLinearTextSize.js'

const HIGHLIGHT_SCALE_FACTOR = 1.5

function getGeometryCenter(geometry) {
  const { type, coordinates } = geometry
  if (type === 'Point') {
    return coordinates
  }
  if (type === 'MultiPoint') {
    return coordinates[0]
  }
  if (type.includes('LineString')) {
    const coords = type === 'LineString' ? coordinates : coordinates[0]
    return [(coords[0][0] + coords[coords.length - 1][0]) / 2, (coords[0][1] + coords[coords.length - 1][1]) / 2]
  }
  if (type.includes('Polygon')) {
    const coords = type === 'Polygon' ? coordinates[0] : coordinates[0][0]
    const sum = coords.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0])
    return [sum[0] / coords.length, sum[1] / coords.length]
  }
  return null
}

function evalInterpolate(expr, zoom) {
  if (typeof expr === 'number') {
    return expr
  }
  if (!Array.isArray(expr) || expr[0] !== 'interpolate') {
    return calculateLinearTextSize(expr, zoom)
    // throw new Error('Only interpolate expressions supported')
  }
  const [, , input, ...stops] = expr
  if (input[0] !== 'zoom') {
    throw new Error('Only zoom-based expressions supported')
  }
  for (let i = 0; i < stops.length - 2; i += 2) {
    const z0 = stops[i]
    const v0 = stops[i + 1]
    const z1 = stops[i + 2]
    const v1 = stops[i + 3]
    if (zoom <= z0) {
      return v0
    }
    if (zoom <= z1) {
      return v0 + (v1 - v0) * ((zoom - z0) / (z1 - z0))
    }
  }
  return stops[stops.length - 1]
}

export function createMapLabelNavigator(map, mapColorScheme, eventBus) {
  let isDarkStyle = mapColorScheme === 'dark'
  let labels = []
  let currentPixel = null
  let highlightLayerId = null
  let highlightedExpr = null
  let highlightedFeature = null

  const colors = {
    get current() {
      if (isDarkStyle) {
        return { text: '#ffffff', halo: '#000000' }
      }
      return { text: '#000000', halo: '#ffffff' }
    }
  }

  const initLabelSource = () => {
    if (!map.getSource('highlighted-label')) {
      map.addSource('highlighted-label', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    }
  }

  map.getStyle().layers.filter(l => l.layout?.['symbol-placement'] === 'line').forEach(l => {
    map.setLayoutProperty(l.id, 'symbol-placement', 'line-center')
  })
  initLabelSource()

  eventBus?.on('map:setmapstyle', style => {
    map.once('styledata', () => map.once('idle', () => {
      map.getStyle().layers.filter(l => l.layout?.['symbol-placement'] === 'line').forEach(l => {
        map.setLayoutProperty(l.id, 'symbol-placement', 'line-center')
      })
      initLabelSource()
      isDarkStyle = style?.mapColorScheme === 'dark'
    }))
  })

  function refreshLabels() {
    const symbolLayers = map.getStyle().layers.filter(l => l.type === 'symbol')
    const features = map.queryRenderedFeatures({ layers: symbolLayers.map(l => l.id) })
    labels = symbolLayers.flatMap(layer => {
      const textField = layer.layout?.['text-field']
      const propName = typeof textField === 'string'
        ? textField.match(/^{(.+)}$/)?.[1]
        : Array.isArray(textField)
        ? textField.find(e => Array.isArray(e) && e[0] === 'get')?.[1]
        : null
      if (!propName) {
        return []
      }
      return features.filter(f => f.layer.id === layer.id && f.properties?.[propName]).map(f => {
        const center = getGeometryCenter(f.geometry)
        if (!center) {
          return null
        }
        const projected = map.project({ lng: center[0], lat: center[1] })
        return { text: f.properties[propName], x: projected.x, y: projected.y, feature: f, layer }
      }).filter(Boolean)
    })
  }

  function removeHighlight() {
    if (highlightLayerId && map.getLayer(highlightLayerId)) {
      try {
        map.removeLayer(highlightLayerId)
      }
      catch {}
      highlightLayerId = null
      highlightedExpr = null
      highlightedFeature = null
    }
  }

  function highlight(labelData) {
    if (!labelData?.feature?.layer) {
      return
    }
    removeHighlight()
    const { feature, layer } = labelData
    highlightLayerId = `highlight-${layer.id}`
    highlightedFeature = labelData
    map.getSource('highlighted-label').setData(feature)
    highlightedExpr = layer.layout['text-size']
    const zoom = map.getZoom()
    const baseSize = evalInterpolate(highlightedExpr, zoom)
    const highlightSize = baseSize * HIGHLIGHT_SCALE_FACTOR
    map.addLayer({
      id: highlightLayerId,
      type: layer.type,
      source: 'highlighted-label',
      layout: { ...layer.layout, 'text-size': highlightSize, 'text-allow-overlap': true, 'text-ignore-placement': true, 'text-max-angle': 90 },
      paint: { ...layer.paint, 'text-color': colors.current.text, 'text-halo-color': colors.current.halo, 'text-halo-width': 3, 'text-halo-blur': 1, 'text-opacity': 1 }
    })
    map.moveLayer(highlightLayerId)
  }

  map.on('zoom', () => {
    if (highlightLayerId && highlightedExpr) {
      const zoom = map.getZoom()
      const baseSize = evalInterpolate(highlightedExpr, zoom)
      map.setLayoutProperty(highlightLayerId, 'text-size', baseSize * HIGHLIGHT_SCALE_FACTOR)
    }
  })

  function highlightCenter() {
    refreshLabels()
    if (!labels.length) {
      return null
    }
    const centerPoint = map.project(map.getCenter())
    const closest = labels.reduce((best, label) => {
      const dist = (label.x - centerPoint.x) ** 2 + (label.y - centerPoint.y) ** 2
      if (!best || dist < best.dist) {
        return { label, dist }
      }
      return best
    }, null)?.label
    if (closest) {
      currentPixel = { x: closest.x, y: closest.y }
    }
    highlight(closest)
    return `${closest.text} (${closest.layer.id})`
  }

  function highlightNext(direction) {
    refreshLabels()
    if (!labels.length) {
      return null
    }
    if (!currentPixel) {
      return highlightCenter()
    }
    const filtered = labels
      .map((l, i) => ({ pixel: [l.x, l.y], index: i }))
      .filter(l => l.pixel[0] !== currentPixel.x || l.pixel[1] !== currentPixel.y)
    if (!filtered.length) {
      return null
    }
    const pixelArray = filtered.map(l => l.pixel)
    let nextFilteredIndex = spatialNavigate(direction, [currentPixel.x, currentPixel.y], pixelArray)
    if (nextFilteredIndex == null || nextFilteredIndex < 0 || nextFilteredIndex >= filtered.length) {
      nextFilteredIndex = 0
    }
    const labelData = labels[filtered[nextFilteredIndex].index]
    currentPixel = { x: labelData.x, y: labelData.y }
    highlight(labelData)
    return `${labelData.text} (${labelData.layer.id})`
  }

  map.getStyle().layers.filter(l => l.type === 'symbol').forEach(layer => {
    map.setPaintProperty(layer.id, 'text-opacity', ['case', ['boolean', ['feature-state', 'highlighted'], false], 0, 1])
  })

  return {
    refreshLabels,
    highlightNextLabel: highlightNext,
    highlightLabelAtCenter: highlightCenter,
    clearHighlightedLabel: removeHighlight
  }
}
