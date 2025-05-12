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

export async function handleStyleChange () {
  const { draw } = this
  reColourMarkers(this)
  setTimeout(draw?.reColour(), 0)
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

export function handleMove (zoom) {
  const { view } = this
  const { maxZoom, minZoom } = view.constraints
  const isMaxZoom = zoom + defaults.ZOOM_TOLERANCE >= maxZoom
  const isMinZoom = zoom - defaults.ZOOM_TOLERANCE <= minZoom
  const resolution = view.resolution
  this.dispatchEvent(new CustomEvent('move', {
    detail: {
      isMaxZoom,
      isMinZoom,
      resolution
    }
  }))
}
