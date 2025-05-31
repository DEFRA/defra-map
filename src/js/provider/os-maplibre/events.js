import { getDetail, addMapHoverBehaviour } from './query'
import { loadSymbols, addHighlightedLabelLayer, amendLineSymbolLayers, addShortcutMarkers, addSelectedLayers } from './symbols'

export const getResolution = (map) => {
  const center = map.getCenter()
  const zoom = map.getZoom()
  const lat = center.lat
  const EARTH_CIRCUMFERENCE = 40075016.686
  const TILE_SIZE = 512
  const scale = Math.pow(2, zoom)
  const resolution = (EARTH_CIRCUMFERENCE * Math.cos((lat * Math.PI) / 180)) / (scale * TILE_SIZE)
  return resolution
}

export const getAttributions = (map) => {
  const style = map.getStyle()
  if (!style) {
    return []
  }

  const currentZoom = map.getZoom()
  const activeAttributions = new Set()

  // Check each layer for visibility at current zoom
  style.layers.forEach(layer => {
    // Skip layers without a source
    if (!layer.source) return

    // Check if layer is visible based on zoom and visibility property
    const minZoom = layer.minzoom !== undefined ? layer.minzoom : 0
    const maxZoom = layer.maxzoom !== undefined ? layer.maxzoom : 24
    const isVisible = currentZoom >= minZoom && currentZoom < maxZoom && (!layer.layout || layer.layout.visibility !== 'none')

    // If layer is visible, get attribution from its source
    if (isVisible) {
      const source = style.sources[layer.source]
      if (source && source.attribution) {
        activeAttributions.add(source.attribution)
      }
    }
  })

  return Array.from(activeAttributions)
}

export async function handleLoad () {
  const { map } = this
  await loadSymbols.bind(this)()
  this.isLoaded = true
  const resolution = getResolution(map)
  const zoom = map.getZoom()
  const attributions = getAttributions(map)
  this.dispatchEvent(new CustomEvent('load', {
    detail: {
      framework: { map },
      resolution,
      zoom,
      attributions
    }
  }))
}

export async function handleStyleLoad () {
  const { map } = this
  // Store ref to baselayers when a new style is loaded
  this.baseLayers = map.getStyle().layers
  // Amend symbol-placement prop so labels have a coordinate
  amendLineSymbolLayers.bind(this)()
  // Add highlighted label layer and source
  addHighlightedLabelLayer.bind(this)()
  // Change cursor type on feature hover
  addMapHoverBehaviour.bind(this)(this.featureLayers, this.labelLayers)
  if (this.isLoaded) {
    await loadSymbols.bind(this)()
    this.dispatchEvent(new CustomEvent('style', {
      detail: {
        type: 'style'
      }
    }))
  }
}

export async function handleIdle () {
  if (this.map) {
    const { map, paddingBox, selectedId, scale } = this
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = paddingBox
    const { offsetTop: parentOffsetTop, offsetLeft: parentOffsetLeft } = paddingBox.parentNode
    const pixel = [offsetLeft + parentOffsetLeft + (offsetWidth / 2), offsetTop + parentOffsetTop + (offsetHeight / 2)].map(c => c / scale)
    const detail = await getDetail.bind(this)(selectedId ? null : pixel)
    const attributions = getAttributions(map)
    addShortcutMarkers.bind(this)(detail?.features?.featuresInViewport)
    this.dispatchEvent(new CustomEvent('update', {
      detail: {
        ...detail,
        attributions
      }
    }))
  }
}

export async function handleMoveStart (e) {
  this.hideLabel()
  this.dispatchEvent(new CustomEvent('movestart', {
    detail: {
      isUserInitiated: e.isUserInitiated || !!e.originalEvent
    }
  }))
}

export function handleMove () {
  const { map } = this
  const isMaxZoom = map.getZoom() >= map.getMaxZoom()
  const isMinZoom = map.getZoom() <= map.getMinZoom()
  const zoom = map.getZoom()
  const resolution = getResolution(map)
  const attributions = getAttributions(map)

  // Need to include maxBounds check as this can also constrain zoom
  this.dispatchEvent(new CustomEvent('move', {
    detail: {
      isMaxZoom,
      isMinZoom,
      zoom,
      resolution,
      attributions
    }
  }))
}

export function handleStyleData (e) {
  if (this.baseLayers.length) {
    const { map, style, selectedId } = this
    const featureLayers = e.target.getStyle().layers.filter(l => this.featureLayers.includes(l.id))
    const selectedLayers = map.getStyle().layers.filter(l => l.id.includes('selected'))
    if (selectedLayers.length !== featureLayers.length) {
      const isDarkBasemap = ['dark', 'aerial'].includes(style.name)
      this.selectedLayers = addSelectedLayers.bind(this)(featureLayers, selectedId, isDarkBasemap)
    }
  }
}

export function handleError (err) {
  console.log(err)
}
