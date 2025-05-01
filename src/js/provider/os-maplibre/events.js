import { getDetail, addMapHoverBehaviour } from './query'
import { loadSymbols, addHighlightedLabelLayer, amendLineSymbolLayers, addShortcutMarkers, addSelectedLayers } from './symbols'

export async function handleLoad () {
  await loadSymbols.bind(this)()
  this.isLoaded = true
  this.dispatchEvent(new CustomEvent('load', {
    detail: {
      framework: { map: this.map }
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
    const { paddingBox, selectedId, scale } = this
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = paddingBox
    const { offsetTop: parentOffsetTop, offsetLeft: parentOffsetLeft } = paddingBox.parentNode
    const pixel = [offsetLeft + parentOffsetLeft + (offsetWidth / 2), offsetTop + parentOffsetTop + (offsetHeight / 2)].map(c => c / scale)
    const detail = await getDetail.bind(this)(selectedId ? null : pixel)
    addShortcutMarkers.bind(this)(detail?.features?.featuresInViewport)
    this.dispatchEvent(new CustomEvent('update', {
      detail
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
  // Need to include maxBounds check as this can also constrain zoom
  this.dispatchEvent(new CustomEvent('move', {
    detail: {
      isMaxZoom,
      isMinZoom
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
