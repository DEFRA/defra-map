import { getDetail } from './query'
import { reColourMarkers } from './marker'

export const handleBaseTileLayerLoaded = (provider) => {
  const { framework, modules } = provider
  provider.isLoaded = true
  provider.dispatchEvent(new CustomEvent('load', {
    detail: {
      modules,
      framework
    }
  }))
}

export const handleStyleChange = async (provider) => {
  const { style, draw } = provider
  reColourMarkers(provider)
  draw?.reColour()
  provider.dispatchEvent(new CustomEvent('style', {
    detail: {
      type: 'style',
      style: style.name
    }
  }))
}

export const handleStationary = async (provider) => {
  const { paddingBox } = provider
  const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = paddingBox
  const { offsetTop: parentOffsetTop, offsetLeft: parentOffsetLeft } = paddingBox.parentNode
  const point = [offsetLeft + parentOffsetLeft + (offsetWidth / 2), offsetTop + parentOffsetTop + (offsetHeight / 2)]
  provider.isUserInitiated = false
  const detail = await getDetail(provider, point)
  provider.dispatchEvent(new CustomEvent('update', {
    detail
  }))
}

export const handleMoveStart = (provider) => {
  provider.dispatchEvent(new CustomEvent('movestart', {
    detail: {
      isUserInitiated: provider.isUserInitiated
    }
  }))
}
