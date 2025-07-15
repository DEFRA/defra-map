import { getDetail, getDimensions } from './query'
import { reColourMarkers } from './marker'
import { defaults } from './constants'

export const getAttributions = (layers) => {
  const baseTileLayer = layers[0]
  const sources = baseTileLayer.currentStyleInfo.style.sources
  const activeAttributions = new Set()
  Object.keys(sources).forEach(source => {
    activeAttributions.add(sources[source].attribution)
  })
  return Array.from(activeAttributions)
}

export function handleBaseTileLayerLoaded () {
  const { framework, modules, view, baseTileLayer } = this
  this.isLoaded = true
  const resolution = view.resolution
  const attributions = getAttributions([baseTileLayer])
  this.dispatchEvent(new CustomEvent('load', {
    detail: {
      modules,
      framework,
      resolution,
      zoom: view.zoom,
      attributions
    }
  }))
}

export async function handleStyleChange (currentStyle, newStyle) {
  // Re-colour graphics if style changes
  if (newStyle.name !== currentStyle.name) {
    reColourMarkers(this)
    this.draw?.reColour()
  }
  this.dispatchEvent(new CustomEvent('style', {
    detail: {
      type: 'style'
    }
  }))
}

export async function handleStationary () {
  const { paddingBox, baseTileLayer } = this
  const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = paddingBox
  const { offsetTop: parentOffsetTop, offsetLeft: parentOffsetLeft } = paddingBox.parentNode
  const point = [offsetLeft + parentOffsetLeft + (offsetWidth / 2), offsetTop + parentOffsetTop + (offsetHeight / 2)]
  this.isUserInitiated = false
  const attributions = getAttributions([baseTileLayer])
  const detail = await getDetail.bind(this)(point)
  const dimensions = getDimensions.bind(this)()
  this.dispatchEvent(new CustomEvent('update', {
    detail: {
      ...detail,
      attributions,
      dimensions
    }
  }))
}

export function handleMoveStart () {
  this.dispatchEvent(new CustomEvent('movestart', {
    detail: {
      isUserInitiated: this.isUserInitiated
    }
  }))
}

export function handleMove () {
  const { view, baseTileLayer } = this
  const { maxZoom, minZoom } = view.constraints
  const isMaxZoom = view.zoom + defaults.ZOOM_TOLERANCE >= maxZoom
  const isMinZoom = view.zoom - defaults.ZOOM_TOLERANCE <= minZoom
  const zoom = view.zoom
  const resolution = view.resolution
  const attributions = getAttributions([baseTileLayer])
  const dimensions = getDimensions?.bind(this)()
  this.dispatchEvent(new CustomEvent('move', {
    detail: {
      isMaxZoom,
      isMinZoom,
      zoom,
      resolution,
      attributions,
      dimensions
    }
  }))
}
