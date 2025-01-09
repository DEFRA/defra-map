import computedStyleToInlineStyle from 'computed-style-to-inline-style'
import { shortcutMarkerHTML } from './marker'
import { parseSVG } from '../../lib/symbols'

export const amendLineSymbolLayers = (map) => {
  const lineSymbolLayers = map.getStyle().layers.filter(l => l.layout && ('symbol-placement' in l.layout) && l.layout['symbol-placement'] === 'line')
  lineSymbolLayers.forEach(l => map.setLayoutProperty(l.id, 'symbol-placement', 'line-center'))
}

export const addHighlightedLabelLayer = (provider) => {
  const { map } = provider
  const layers = map.getStyle().layers
  provider.labelLayers = layers.filter(l => l.id !== 'label' && l.layout && l.layout['text-field']).map(l => l.id)
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
      'text-halo-width': 2,
      'text-halo-blur': 1,
      'text-opacity': 1
    }
  })
}

export const addShortcuts = (provider, features) => {
  const { map, shortcutMarkers } = provider
  const { Marker } = provider.modules
  shortcutMarkers.forEach(m => m.remove())
  features.forEach((f, i) => shortcutMarkers.push(
    new Marker({ element: shortcutMarkerHTML(i + 1) }).setLngLat(f.coord).addTo(map)
  ))
}

export const setSelectedLabelStyle = (map, scale, basemap, feature) => {
  if (map && feature) {
    map.moveLayer('label')
    map.getSource('label').setData({
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        ...feature.properties,
        layer: feature.layer.id
      }
    })
    map.setLayoutProperty('label', 'symbol-placement', feature.layer.layout['symbol-placement'])
    map.setLayoutProperty('label', 'text-field', feature.layer.layout['text-field'].sections[0].text)
    map.setLayoutProperty('label', 'text-font', feature.layer.layout['text-font'])
    map.setLayoutProperty('label', 'text-letter-spacing', feature.layer.layout['text-letter-spacing'])
    map.setLayoutProperty('label', 'text-size', feature.layer.layout['text-size'] * (scale === 1 ? 1.5 : 1.25))
    map.setPaintProperty('label', 'text-color', (basemap === 'dark' ? '#ffffff' : '#000000'))
    map.setPaintProperty('label', 'text-halo-color', (basemap === 'dark' ? '#000000' : '#ffffff'))
  } else {
    map.getSource('label')?.setData({
      type: 'FeatureCollection',
      features: []
    })
  }
}

export const addSelectedFeatureLayers = (map, layers, selectedId, isDarkBasemap) => {
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
    map.addLayer(layer)
  }
}

export const loadSymbols = (provider) => {
  let fn
  if (provider.symbols?.length) {
    const { map, symbols, basemap } = provider
    const isDarkBasemap = ['dark', 'aerial'].includes(basemap)

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
  const target = map.getCanvasContainer()
  target.insertAdjacentHTML('beforeend', parsed)
  const el = target.lastChild
  computedStyleToInlineStyle(el, { recursive: true, properties: ['stroke', 'fill'] })
  const base64 = 'data:image/svg+xml;base64,' + btoa(target.lastChild.outerHTML)
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
