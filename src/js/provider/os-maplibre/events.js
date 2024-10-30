import { getDetail } from './query'
import { loadSymbols, addSelectedLayers } from './symbols'

export const handleLoad = async (provider, e) => {
  await loadSymbols(provider)
  provider.baseLayers = provider.map.getStyle().layers
  provider.isLoaded = true
  provider.dispatchEvent(new CustomEvent('load', {
    detail: {
      map: provider.map
    }
  }))
}

export const handleStyleLoad = async (provider) => {
  if (!provider.isLoaded) return
  await loadSymbols(provider)
  const { basemap } = provider
  provider.dispatchEvent(new CustomEvent('style', {
    detail: {
      type: 'basemap',
      basemap
    }
  }))
}

export const handleIdle = async (provider) => {
  if (!provider.map) return
  const { paddingBox, selectedId, scale } = provider
  const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = paddingBox
  const pixel = [offsetLeft + (offsetWidth / 2), offsetTop + (offsetHeight / 2)].map(c => c / scale)
  const detail = await getDetail(provider, selectedId ? null : pixel)
  provider.dispatchEvent(new CustomEvent('update', {
    detail
  }))
}

export const handleMoveStart = (provider, e) => {
  provider.dispatchEvent(new CustomEvent('movestart', {
    detail: {
      isUserInitiated: e.isUserInitiated || !!e.originalEvent
    }
  }))
}

export const handleStyleData = (provider, e) => {
  if (!provider.baseLayers.length) return
  const { map, basemap, selectedId } = provider
  const featureLayers = e.target.getStyle().layers.filter(l => provider.featureLayers.includes(l.id))

  if (map.getStyle().layers.filter(l => l.id.includes('selected')).length === featureLayers.length) return

  const isDarkBasemap = ['dark', 'aerial'].includes(basemap)

  addSelectedLayers(map, featureLayers, selectedId, isDarkBasemap)
}

export const handleError = (provider, err) => {
  console.log(err)
}
