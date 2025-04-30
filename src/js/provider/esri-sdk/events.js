import { getDetail } from './query'
import { reColourMarkers } from './marker'
import { defaults } from './constants'

export function handleBaseTileLayerLoaded () {
  const { framework, modules } = this
  this.isLoaded = true
  this.dispatchEvent(new CustomEvent('load', {
    detail: {
      modules,
      framework
    }
  }))
}

export async function handleStyleChange () {
  const { draw } = this
  reColourMarkers(this)
  draw?.reColour()
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
  const detail = await getDetail(this, point)
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
  const { maxZoom, minZoom } = this.view.constraints
  const isMaxZoom = zoom + defaults.ZOOM_TOLERANCE >= maxZoom
  const isMinZoom = zoom - defaults.ZOOM_TOLERANCE <= minZoom
  this.dispatchEvent(new CustomEvent('move', {
    detail: {
      isMaxZoom,
      isMinZoom
    }
  }))
}
