import computedStyleToInlineStyle from 'computed-style-to-inline-style'
import { parseSVG } from '../../lib/symbols'

export const addSelectedLayers = (map, layers, selectedId, isDarkBasemap) => {
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
    if (map.getLayer(layer.id)) map.removeLayer(layer.id)
    map.addLayer(layer)
  }
}

export const loadSymbols = (provider) => {
  if (provider.symbols?.length) {
    const { map, symbols, basemap } = provider
    const isDarkBasemap = ['dark', 'aerial'].includes(basemap)

    return Promise.all(symbols.map(u => fetch(u))).then(responses =>
      Promise.all(responses.map(r => r.text()))
    ).then(texts => Promise.all(texts.map((t, i) => loadImage(getName(symbols[i]), t, map, isDarkBasemap))
      .concat(texts.map((t, i) => loadImage(`${getName(symbols[i])}-selected`, t, map, isDarkBasemap)))
    ))
  }
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
