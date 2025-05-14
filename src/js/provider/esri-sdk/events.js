import { getDetail } from './query'
import { reColourMarkers } from './marker'
import { defaults } from './constants'

export function handleBaseTileLayerLoaded () {
  const { framework, modules, view } = this
  this.isLoaded = true
  const resolution = view.resolution
  this.dispatchEvent(new CustomEvent('load', {
    detail: {
      modules,
      framework,
      resolution
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
  const { paddingBox } = this
  const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = paddingBox
  const { offsetTop: parentOffsetTop, offsetLeft: parentOffsetLeft } = paddingBox.parentNode
  const point = [offsetLeft + parentOffsetLeft + (offsetWidth / 2), offsetTop + parentOffsetTop + (offsetHeight / 2)]
  this.isUserInitiated = false
  const detail = await getDetail.bind(this)(point)
  this.dispatchEvent(new CustomEvent('update', {
    detail
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
  const { view } = this
  const { maxZoom, minZoom } = view.constraints
  const isMaxZoom = view.zoom + defaults.ZOOM_TOLERANCE >= maxZoom
  const isMinZoom = view.zoom - defaults.ZOOM_TOLERANCE <= minZoom
  const resolution = view.resolution
  console.log('move')
  this.dispatchEvent(new CustomEvent('move', {
    detail: {
      isMaxZoom,
      isMinZoom,
      resolution
    }
  }))
}
