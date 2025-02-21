import computedStyleToInlineStyle from 'computed-style-to-inline-style'
import { defaults } from './constants'
import { shortcutMarkerHTML } from './marker'
import { parseSVG } from '../../lib/symbols'

const SYMBOL_PLACEMENT = 'symbol-placement'
const TEXT_FIELD = 'text-field'
const SCALE_FACTOR_SMALL = 1.5
const SCALE_FACTOR_LARGE = 1.25

export const amendLineSymbolLayers = (map) => {
  const lineSymbolLayers = map.getStyle().layers.filter(l => l.layout && (SYMBOL_PLACEMENT in l.layout) && l.layout[SYMBOL_PLACEMENT] === 'line')
  lineSymbolLayers.forEach(l => map.setLayoutProperty(l.id, SYMBOL_PLACEMENT, 'line-center'))
}

export const addHighlightedLabelLayer = (provider) => {
  const { map } = provider
  const layers = map.getStyle().layers
  provider.labelLayers = layers.filter(l => l.id !== 'label' && l.layout ? l.layout[TEXT_FIELD] : null).map(l => l.id)
  map.addSource('label', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
  map.addLayer({
    id: 'label',
    type: 'symbol',
    source: 'label',
    layout: {
      'text-allow-overlap': true,
      'text-ignore-placement': true
    },
    paint: {
      'text-halo-width': 3,
      'text-halo-blur': 1,
      'text-opacity': 1
    }
  })
}

export const addShortcutMarkers = (provider, features) => {
  const { map, shortcutMarkers } = provider
  const { Marker } = provider.modules
  shortcutMarkers.forEach(m => m.remove())
  features.forEach((f, i) => {
    const offset = f.geometryType === 'Point' ? [0, defaults.SHORTCUT_LABEL_OFFSET] : [0, 0]
    shortcutMarkers.push(new Marker({ element: shortcutMarkerHTML(i + 1), offset }).setLngLat(f.coord).addTo(map))
  })
}

export const highlightLabel = (map, scale, style, feature) => {
  if (!map.style) {
    return
  }

  if (feature) {
    map.moveLayer('label')
    map.getSource('label').setData({
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        ...feature.properties,
        layer: feature.layer.id
      }
    })
    // Clone layout properties
    const textScale = scale === 1 ? SCALE_FACTOR_SMALL : SCALE_FACTOR_LARGE
    const textField = feature.layer.layout[TEXT_FIELD]
    map.setLayoutProperty('label', SYMBOL_PLACEMENT, feature.layer.layout[SYMBOL_PLACEMENT])
    map.setLayoutProperty('label', TEXT_FIELD, textField.sections ? textField.sections[0].text : textField)
    map.setLayoutProperty('label', 'text-font', feature.layer.layout['text-font'])
    map.setLayoutProperty('label', 'text-letter-spacing', feature.layer.layout['text-letter-spacing'])
    map.setLayoutProperty('label', 'text-size', feature.layer.layout['text-size'] * textScale)
    map.setLayoutProperty('label', 'text-anchor', feature.layer.layout['text-anchor'])
    map.setLayoutProperty('label', 'text-justify', feature.layer.layout['text-justify'])
    map.setLayoutProperty('label', 'text-offset', feature.layer.layout['text-offset']?.map(o => o / textScale))
    // Clone paint properties
    map.setPaintProperty('label', 'text-color', (style === 'dark' ? '#ffffff' : '#000000'))
    map.setPaintProperty('label', 'text-halo-color', (style === 'dark' ? '#000000' : '#ffffff'))
  } else {
    map?.getSource('label')?.setData({
      type: 'FeatureCollection',
      features: []
    })
  }
}

export const addSelectedLayers = (map, layers, selectedId, isDarkBasemap) => {
  const selectedLayers = []
  for (const layer of layers) {
    layer.id = `${layer.id}-selected`
    layer.filter = ['==', 'id', selectedId || '']
    if (layer.type === 'symbol') {
      layer.layout['icon-image'] = ['concat', layer.layout['icon-image'], '-selected']
    }
    if (layer.type === 'fill') {
      layer.paint = { 'line-color': isDarkBasemap ? '#ffffff' : '#0b0c0c', 'line-width': 2 }
      layer.type = 'line'
    }
    if (map.getLayer(layer.id)) {
      map.removeLayer(layer.id)
    }
    selectedLayers.push(layer.id)
    map.addLayer(layer)
  }
  return selectedLayers
}

export const loadSymbols = (provider) => {
  let fn
  if (provider.symbols?.length) {
    const { map, symbols, style } = provider
    const isDarkBasemap = ['dark', 'aerial'].includes(style.name)

    fn = Promise.all(symbols.map(u => fetch(u))).then(responses =>
      Promise.all(responses.map(r => r.text()))
    ).then(texts => Promise.all(texts.map((t, i) => loadImage(getName(symbols[i]), t, map, isDarkBasemap))
      .concat(texts.map((t, i) => loadImage(`${getName(symbols[i])}-selected`, t, map, isDarkBasemap)))
    ))
  }
  return fn
}

const getName = path => {
  const extNumChars = 4
  return path.split('\\').pop().split('/').pop().slice(0, -Math.abs(extNumChars))
}

const loadImage = (name, text, map, isDarkBasemap) => {
  const parsed = parseSVG(name, null, text, isDarkBasemap, 2)
  const container = map.getCanvasContainer()
  container.insertAdjacentHTML('beforeend', parsed)
  const el = container.lastChild
  computedStyleToInlineStyle(el, { recursive: true, properties: ['stroke', 'fill'] })
  const base64 = 'data:image/svg+xml;base64,' + btoa(container.lastChild.outerHTML)
  const img = document.createElement('img')
  el?.remove()
  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        if (map?.hasImage(name)) {
          return
        }
        map.addImage(name, img)
        resolve(img)
      } catch (err) {
        console.log(err)
      }
    }
    img.onerror = reject
    img.src = base64
  })
}
