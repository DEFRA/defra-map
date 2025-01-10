import { getDetail, addMapHoverBehaviour } from './query'
import { loadSymbols, addSelectedFeatureLayers, addHighlightedLabelLayer, amendLineSymbolLayers, addShortcutMarkers } from './symbols'

export const handleLoad = async (provider) => {
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
  const { map } = provider
  // Amend symbol-placement prop to so labels have a coordinate
  amendLineSymbolLayers(map)
  // Add highlighted label layer and source
  addHighlightedLabelLayer(provider)
  // Change cursor type on feature hover
  addMapHoverBehaviour(provider)
  if (provider.isLoaded) {
    await loadSymbols(provider)
    const { basemap } = provider
    provider.dispatchEvent(new CustomEvent('style', {
      detail: {
        type: 'basemap',
        basemap
      }
    }))
  }
}

export const handleIdle = async (provider) => {
  if (provider.map) {
    const { paddingBox, selectedId, scale } = provider
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = paddingBox
    const { offsetTop: parentOffsetTop, offsetLeft: parentOffsetLeft } = paddingBox.parentNode
    const pixel = [offsetLeft + parentOffsetLeft + (offsetWidth / 2), offsetTop + parentOffsetTop + (offsetHeight / 2)].map(c => c / scale)
    const detail = await getDetail(provider, selectedId ? null : pixel)
    addShortcutMarkers(provider, detail?.features?.featuresInViewport)
    provider.dispatchEvent(new CustomEvent('update', {
      detail
    }))
  }
}

export const handleMoveStart = (provider, e) => {
  provider.hideLabel()
  provider.dispatchEvent(new CustomEvent('movestart', {
    detail: {
      isUserInitiated: e.isUserInitiated || !!e.originalEvent
    }
  }))
}

export const handleStyleData = (provider, e) => {
  if (provider.baseLayers.length) {
    const { map, basemap, selectedId } = provider
    const layers = map.getStyle().layers
    const featureLayers = layers.filter(l => provider.featureLayers.includes(l.id))
    if (!(layers.filter(l => l.id.includes('selected')).length === featureLayers.length)) {
      const isDarkBasemap = ['dark', 'aerial'].includes(basemap)
      addSelectedFeatureLayers(map, featureLayers, selectedId, isDarkBasemap)
    }
  }
}

export const handleError = (_provider, err) => {
  console.log(err)
}
